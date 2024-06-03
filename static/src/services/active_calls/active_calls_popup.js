/** @odoo-module **/
import {useService} from "@web/core/utils/hooks"

import {Component, useState} from "@odoo/owl"

export class ActiveCallsPopup extends Component {
    static template = 'asterisk_plus.active_calls_popup'

    constructor() {
        super(...arguments)
        this.state = useState({
            isDisplay: false,
            calls: [],
        })
        this.hideTimer = null
    }

    setup() {
        super.setup()
        this.rpc = useService('rpc')
        this.orm = useService('orm')
        this.action = useService('action')
        this.props.bus.addEventListener('active_calls_toggle_display', (ev) => this.toggleDisplay(ev))
    }

    async getCalls() {
        const fields = [
            "calling_number",
            "called_number",
            "calling_user",
            "answered_user",
            "direction",
            "partner",
            'ref',
            'ref_name'
        ]
        this.state.calls = await this.orm.searchRead(
            "asterisk_plus.call",
            [["is_active", "=", true]],
            fields
        )
        if (this.state.calls.length > 0) {
            this.setTimer(3000)
        } else {
            this.setTimer(600)
        }
    }

    setTimer(seconds) {
        const self = this
        self.hideTimer = setTimeout(() => {
            self.state.isDisplay = false
        }, seconds)
    }

    async toggleDisplay() {
        this.state.isDisplay = !this.state.isDisplay
        if (this.state.isDisplay) {
            await this.getCalls()
        } else {
            clearTimeout(this.hideTimer)
        }
    }


    _OpenActiveCallForm(id) {
        this.action.doAction({
            res_id: id,
            res_model: 'asterisk_plus.call',
            target: 'current',
            type: 'ir.actions.act_window',
            views: [[false, 'form']],
        })
    }

    _openPartnerForm(ev, partner) {
        if (partner) {
            ev.stopPropagation()
            this.action.doAction({
                res_id: partner[0],
                res_model: 'res.partner',
                target: 'current',
                type: 'ir.actions.act_window',
                views: [[false, 'form']],
            })
        }
    }

    _openReferenceForm(ev, ref) {
        if (ref) {
            ev.stopPropagation()
            let [res_model, res_id] = ref.split(',')
            res_id = parseInt(res_id)
            this.action.doAction({
                res_id,
                res_model,
                target: 'current',
                type: 'ir.actions.act_window',
                views: [[false, 'form']],
            })
        }
    }

    _onMouseOver(ev) {
        clearTimeout(this.hideTimer)
    }

    _onMouseOut(ev) {
        this.setTimer(1000)
    }

}

