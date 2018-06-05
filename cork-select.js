import "@polymer/polymer"
import template from "./cork-select.html"

import "@ucd-lib/cork-popup-button"

export class CorkSelect extends PolymerElement {

  static get properties() {
    return {
      active : {
        type : Boolean,
        value : false,
        notify : true,
        observer : '_onActive'
      },
      options: {
        type: Array,
        value: function() {
          return [];
        },
        observer: '_onOptionsChange'
      },
      _options: {
        type: Array,
        value: function() {
          return [];
        }
      },
      label : {
        type : String,
        value : ''
      },
      value : {
        type : String,
        value : '',
        notify : true,
        observer : '_onValueChange'
      },
      icon : {
        type : String,
        value : ''
      },
      focusIndex : {
        type : Number,
        value : 0
      }
    };
  }

  static get template() {
    return html([template]);
  }

  ready() {
    super.ready();
    this._resize = this._resize.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this._resize();
    window.addEventListener('resize', this._resize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    // make sure drop down is at least width of input
    this.$.btn.$.popup.style.minWidth = this.$.btn.offsetWidth+'px';
  }

  _onActive() {
    if( !this.active ) {
      this.$.btn.focus();
    } else {
      this._resize();

      var i;
      for( i = this.options.length-1; i >= 0; i-- ) {
        if( this.value === this.options[i].value ) {
          break;
        }
      }
      this.focusIndex = i;

      this._focusOption();
    }
  }

  _focusOption() {
    var optionEles = this.$.optionsRoot.querySelectorAll('.option');
    if( optionEles && optionEles.length > this.focusIndex ) {
      optionEles[this.focusIndex].focus();
    }
  }

  _focusUp() {
    this.focusIndex--;
    if( this.focusIndex < 0 ) {
      this.focusIndex = this.options.length - 1;
    }
    this._focusOption();
  }

  _focusDown() {
    this.focusIndex++;
    if( this.focusIndex == this.options.length ) {
      this.focusIndex = 0;
    }
    this._focusOption();
  }

  _onOptionsChange() {
    this._options = this.options.map((option) => {
      return {
        label : option.label || option.value,
        value : option.value,
        icon : option.icon || ''
      }
    })
  }

  _onValueChange() {
    var item;
    for( var i = 0; i < this.options.length; i++ ) {
      if( this.options[i].value === this.value ) {
        this.label = this.options[i].label || this.value;
        this.icon = this.options[i].icon || '';
        return;
      }
    }
  }

  _onOptionClick(e) {
    this.$.btn.toggle();
    
    var selected = this.options[parseInt(e.currentTarget.getAttribute('index'))];
    this.icon = selected.icon || '';
    this.value = selected.value || '';
    this.label = selected.label || this.value;

    var payload = {
      bubbles: true, 
      composed: true,
      details : {
        value : this.value,
        label : this.label,
        icon : this.icon
      }
    }

    this.dispatchEvent(new CustomEvent('change', payload));
  }

  _onKeyDown(e) {
    this._prevent(e);
  }

  _onKeyPress(e) {
    this._prevent(e);
  }

  _onKeyUp(e) {
    if( !this.active ) return;

    // enter
    if( e.which === 13 ) {
      this._onOptionClick(e);
    // up arrow
    } else if( e.which === 38 ) {
      this._focusUp();
    // tab or down arrow
    } else if( e.which === 40 || e.which === 9) {
      this._focusDown();
    // escape
    } else if( e.which === 27 ) {
      this.active = false;
    }
    
    this._prevent(e);
  }

  _prevent(e) {
    e.stopPropagation();
    e.preventDefault();
  }
}

window.customElements.define('cork-select', CorkSelect);