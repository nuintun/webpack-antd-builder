import propTypes from 'prop-types';
import React, { Fragment } from 'react';

export default class TableProvider extends React.Component {
  static propTypes = {
    onLoad: propTypes.func,
    children: propTypes.func
  };

  state = {
    payload: null
  };

  fetch({ filter, sorter, pager }) {
    const source = this.props.source;
    const onLoad = this.props.onLoad;

    onLoad && onLoad(false);

    fetch(source)
      .then(response => response.json())
      .then(response => {
        if (response.Code === 200) {
          this.setState({
            payload: response.Payload
          });
        }

        onLoad && onLoad(true);
      })
      .catch(error => onLoad && onLoad(true));
  }

  componentDidMount() {
    this.fetch(this.props);
  }

  componentWillReceiveProps(props) {
    this.fetch(props);
  }

  render() {
    const payload = this.state.payload;

    if (payload === null) return null;

    return <Fragment>{this.props.children(payload)}</Fragment>;
  }
}
