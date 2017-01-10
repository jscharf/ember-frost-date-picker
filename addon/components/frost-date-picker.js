import Ember from 'ember'
import PikadayOptions from '../utils/pikaday-options'
import FrostText from 'ember-frost-core/components/frost-text'
import PropTypeMixin, {PropTypes} from 'ember-prop-types'
import SpreadMixin from 'ember-spread'
import layout from '../templates/components/frost-date-picker'

const {
  run,
  merge,
  computed
} = Ember

const {
  moment,
  Pikaday
} = window

export default FrostText.extend(SpreadMixin, PropTypeMixin, {
  layout,
  // == Pikaday Options ===========
  propTypes: {
    options: PropTypes.object,
    hook: PropTypes.string,
    format: PropTypes.string,
    theme: PropTypes.string,
    onSelect: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    onDraw: PropTypes.func,
    validator: PropTypes.func,
    hideIcon: PropTypes.bool,
    GENERIC_ERROR: PropTypes.string
  },
  field: computed(function () {
    return this.$('input')[0]
  }),
  didInsertElement () {
    this._super(...arguments)
    run.schedule('sync', this, function () {
      this.set(
        'value',
        this.get('value') || moment().format(this.get('format'))
      )
      let options = {}
      let _assign = (el, value, type) => {
        if (value) {
          if (type === 'callback') {
            options[el] = run.bind(this, value)
          } else {
            options[el] = value
          }
        }
      }
      PikadayOptions.forEach(v => {
        switch (typeof v) {
          case 'object':
            _assign(v.label, this.get(v.ref), v.type)
            break
          case 'string':
            _assign(v, this.get(v))
        }
      })
      options['onSelect'] = run.bind(this, this.actions._onSelect)
      this.set(
        'el',
        new Pikaday(merge(this.get('options'), options))
      )
    })
  },
  willDestroyElement () {
    this._super(...arguments)
    this.get('el').destroy()
  },
  isValid (value) {
    if (this.validator) {
      let result = this.validator(value)
      if (result !== undefined) {
        return result
      }
    }
    return moment(value).isValid()
  },
  getDefaultProps () {
    return {
      hook: 'date-picker',
      options: {},
      format: 'YYYY-MM-DD',
      theme: 'frost-theme',
      hideIcon: false,
      GENERIC_ERROR: 'Invalid Date Format'
    }
  },
  actions: {
    _onSelect (date) {
      let el = this.get('el')
      let value = el.toString()
      this.set('value', value)

      if (this.isValid(value)) {
        const onSelect = this.get('onSelect')

        if (onSelect) {
          onSelect(value, el)
        }
      } else {
        const onError = this.get('onError')
        const e = Error(this.get('GENERIC_ERROR'))
        onError ? onError(e) : console.warn(e)
      }
    }
  }
})