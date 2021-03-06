import React, { Component, PropTypes } from 'react';
import * as BaseCommands from './commands';
import Bash from './bash';
import Styles from './styles';

const CTRL_CHAR_CODE = 17;
const L_CHAR_CODE = 76;
const C_CHAR_CODE = 67;
const UP_CHAR_CODE = 38;
const DOWN_CHAR_CODE = 40;
const TAB_CHAR_CODE = 9;
const noop = () => {};

export default class Terminal extends Component {

    constructor({ history, structure, extensions, prefix, bash }) {
        super();
        this.Bash = bash || new Bash(extensions);
        this.ctrlPressed = false;
        // this.state = {
        //     settings: { user: { username: prefix.split('@')[1] } },
        //     history: history.slice(),
        //     structure: Object.assign({}, structure),
        //     cwd: '',
        // };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.refs.input.focus();
    }

    /*
     * Utilize immutability
     */
    shouldComponentUpdate(nextProps, nextState) {
        return (this.state !== nextState) || (this.props !== nextProps);
    }

    /*
     * Keep input in view on change
     */
    componentDidUpdate() {
      if (!this.props.inputDisabled) {
        this.refs.input.scrollIntoView();
      }
    }

    /*
     * Forward the input along to the Bash autocompleter. If it works,
     * update the input.
     */
    attemptAutocomplete() {
        const input = this.refs.input.value;
        const suggestion = this.Bash.autocomplete(input, this.props.terminal);
        if (suggestion) {
            this.refs.input.value = suggestion;
        }
    }

    /*
     * Handle keydown for special hot keys. The tab key
     * has to be handled on key down to prevent default.
     * @param {Event} evt - the DOM event
     */
    handleKeyDown(evt) {
        if (evt.which === CTRL_CHAR_CODE) {
            this.ctrlPressed = true;
        } else if (evt.which === TAB_CHAR_CODE) {
            // Tab must be on keydown to prevent default
            this.attemptAutocomplete();
            evt.preventDefault();
        }
    }

    /*
     * Handle keyup for special hot keys.
     * @param {Event} evt - the DOM event
     *
     * -- Supported hot keys --
     * ctrl + l : clear
     * ctrl + c : cancel current command
     * up - prev command from history
     * down - next command from history
     * tab - autocomplete
     */
    handleKeyUp(evt) {
        if (evt.which === L_CHAR_CODE) {
            if (this.ctrlPressed) {
                this.setState(this.Bash.execute('clear', this.state));
            }
        } else if (evt.which === C_CHAR_CODE) {
            if (this.ctrlPressed) {
                this.refs.input.value = '';
            }
        } else if (evt.which === UP_CHAR_CODE) {
            if (this.Bash.hasPrevCommand()) {
                this.refs.input.value = this.Bash.getPrevCommand();
            }
        } else if (evt.which === DOWN_CHAR_CODE) {
            if (this.Bash.hasNextCommand()) {
                this.refs.input.value = this.Bash.getNextCommand();
            } else {
                this.refs.input.value = '';
            }
        } else if (evt.which === CTRL_CHAR_CODE) {
            this.ctrlPressed = false;
        }
    }

    handleSubmit(evt) {
        evt.preventDefault();

        // Execute command
        const input = evt.target[0].value;
        const newState = this.Bash.execute(input, this.props.terminal);
        this.props.onUpdateState(newState);
        this.refs.input.value = '';
    }

    getInput(theme, styles, cwd, prefix, startBashChat) {
      const style = Object.assign({}, Styles[theme] || Styles.light, styles);
      let joinedPrefix = `${prefix} ~${cwd} $`;
      if (startBashChat) {
        joinedPrefix = 'say:'
      }

      return (
        <form onSubmit={evt => this.handleSubmit(evt)} style={style.form}>
            <span style={style.prefix}>{joinedPrefix}</span>
            <input
              autoComplete="off"
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
              ref="input"
              style={style.input} />
        </form>
      );
    };

    renderHistoryItem(style, startBashChat) {
      return (item, key) => {
          let joinedPrefix = `${this.props.prefix} ~${item.cwd} $`;
          if (startBashChat) {
            joinedPrefix = `${this.props.prefix}>`;
          }
          let prefix = item.hasOwnProperty('cwd') ? (
              <span style={style.prefix}>{joinedPrefix}</span>
          ) : undefined;
          let type = item.type || 'text';

          if (type === 'hacker-response') {
            prefix = 'user8162030~host > '
          }

          return <div data-test-id={`history-${key}`} key={key} className={`${type}-type`}>{prefix}{item.value}</div>;
      };
    }

    render() {
        const { onClose, onExpand, onMinimize, prefix, styles, theme, children, inputDisabled, terminal: { history, cwd }, startBashChat } = this.props;
        const style = Object.assign({}, Styles[theme] || Styles.light, styles);
        return (
            <div className="ReactBash" style={style.ReactBash} id='terminal1'>
                <div style={style.header}>
                    <span style={style.redCircle} onClick={onClose}></span>
                    <span style={style.yellowCircle} onClick={onMinimize}></span>
                    <span style={style.greenCircle} onClick={onExpand}></span>
                </div>
                <div style={style.body} onClick={() => this.refs.input && this.refs.input.focus()}>
                    {history.map(this.renderHistoryItem(style, startBashChat))}
                    {children}
                    {(inputDisabled) ? null : this.getInput(theme, styles, cwd, prefix, startBashChat)}
                </div>
            </div>
        );
    }
}

Terminal.Themes = {
    LIGHT: 'light',
    DARK: 'dark',
};

Terminal.defaultProps = {
    onClose: noop,
    onExpand: noop,
    onMinimize: noop,
    prefix: 'user2404712@home',
    styles: {},
    terminal: {
      structure: {},
      extensions: {},
      history: [],
    },
    theme: Terminal.Themes.LIGHT,
};
