// @flow

import * as React from 'react';
// eslint-disable-next-line
import {Button, message} from 'antd';
import store from './store';
import type {onChangeFunc, UpdateType} from './store';
import {Context, createEmptyData} from 'canner-helpers';
import RefId from 'canner-ref-id';

type Props = {
  value: *,
  refId?: RefId,
  keyName: string,
  items?: Object,
  onChange?: onChangeFunc,
  className?: string,
  children: typeof React.Children,
  liteCMS?: React.ComponentType<*>,
  style?: Object,
  title?: string
}

type State = {
  value: *,
  refId: RefId
}

const wrap = (Com: React.ComponentType<*>) => {
  return class wrappedComponent extends React.PureComponent<Props, State> {
    constructor(props: Props) {
      super(props);
      const refId = props.refId ?
        props.refId.child(props.keyName) :
        new RefId(props.keyName)
      this.state = {
        value: getValue(store.getValue(), refId),
        refId
      }
    }

    componentWillReceiveProps() {
      this.updateValue();
    }

    onChange = (refId: RefId, type: UpdateType, delta: *) => {
      const {items = {}, onChange} = this.props;
      if (onChange) {
        onChange(refId, type, delta);
      }

      if (type === 'create') {
        delta = createEmptyData(items);
      }

      store.onChange(refId, type, delta);
      this.updateValue();
    }

    updateValue = () => {
      this.setState({
        value: getValue(store.getValue(), this.state.refId)
      });
    }

    render() {
      const {value, refId} = this.state;
      let {children, title, liteCMS, className, style = {}, ...rest} = this.props;
      const contextValue = {
        renderChildren: (props) => children ? React.Children.map(children, (child) => React.cloneElement(child, props)) : 'this is content',
        renderComponent: (props) => liteCMS ? <liteCMS {...props} /> : 'this is content',
        renderConfirmButton: genFakeButton({text: 'Confirm'}),
        renderCancelButton: genFakeButton({text: 'Cancel'}),
        refId
      }
      return(
        <Context.Provider value={contextValue}>
          <div className={className} style={{
            marginTop: 16,
            ...style
          }}>
            <h3>
              {title || this.props.keyName.toUpperCase()}
            </h3>
            <Com
              {...rest}
              onChange={this.onChange}
              value={value}
              refId={refId}
              goTo={goTo}
            />
          </div>
        </Context.Provider>
      )
    }
  }
}
export default wrap;

function getValue(value, refId) {
  const pathArr = refId.getPathArr() || [];
  return value.getIn(pathArr);
}

function goTo(path) {
  message.success(`go to 'baseUrl/${path}`);
}

function genFakeButton({
  // eslint-disable-next-line
  text,
  // eslint-disable-next-line
  style
}: Object) {
  return function Button({
    disabled = false,
    // eslint-disable-next-line
    style = style,
    // eslint-disable-next-line
    refId,
    // eslint-disable-next-line
    onClick,
    // eslint-disable-next-line
    callback = () => {},
    text = text,
    component = Button
  } = {}) {
    return React.createElement(component, {
      disabled,
      style: style,
      onClick: () => {}
    }, text);
  };
}