/**
 * The tracks author rendering.
 */
import _ from 'lodash';
import PT from 'prop-types';
import React, { Component } from 'react';
import { themr } from 'react-css-super-themr';

import iconDown from 'assets/images/dropdown-arrow.png';
import defaultTheme from './themes/default.scss';


export class TracksAuthorInner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowPopup: false,
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  /**
   * Event if clicked on outside of element
   */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ isShowPopup: false });
    }
  }

  render() {
    const {
      theme,
      selected,
      options,
      onSelected,
      className,
    } = this.props;
    const {
      isShowPopup,
    } = this.state;

    // sort by author name
    options.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return (
      <div ref={this.setWrapperRef} className={`${theme.container} ${className}`}>
        <span className={theme.title}>Authors</span>
        <button
          type="button"
          className={theme.header}
          onClick={() => {
            this.setState({ isShowPopup: !isShowPopup });
          }}
        >
          <span>{selected}</span>
          <img width="15" height="9" className={theme['icon-arrow']} src={iconDown} alt="dropdown-arraow-icon" />
        </button>
        {isShowPopup && (
          <div className={theme.popup}>
            {
              _.map(options, option => (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    onSelected(option);
                    this.setState({ isShowPopup: false });
                  }}
                ><span>{option}</span>
                </button>
              ))
            }
          </div>
        )}
      </div>
    );
  }
}

TracksAuthorInner.defaultProps = {
  selected: '',
  className: '',
  options: [],
  onSelected: () => {},
};

TracksAuthorInner.propTypes = {
  theme: PT.shape({
    container: PT.string.isRequired,
    title: PT.string.isRequired,
    header: PT.string.isRequired,
    popup: PT.string.isRequired,
    'icon-arrow': PT.string.isRequired,
  }).isRequired,
  selected: PT.string,
  options: PT.arrayOf(PT.string),
  onSelected: PT.func,
  className: PT.string,
};

export default themr('Contentful-Blog', defaultTheme)(TracksAuthorInner);
