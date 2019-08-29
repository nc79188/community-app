/* eslint-disable react/no-unused-state */
/**
 * The core article rendering.
 */
import _ from 'lodash';
import React from 'react';
import PT from 'prop-types';
import { fixStyle } from 'utils/contentful';
import { getService } from 'services/contentful';
import MarkdownRenderer from 'components/MarkdownRenderer';
import ContentfulLoader from 'containers/ContentfulLoader';
import LoadingIndicator from 'components/LoadingIndicator';
import YouTubeVideo from 'components/YouTubeVideo';
import moment from 'moment';
import localStorage from 'localStorage';
import { Modal } from 'topcoder-react-ui-kit';
import { config } from 'topcoder-react-utils';
// SVGs and assets
import GestureIcon from 'assets/images/icon-gesture.svg';
import RightArrowIcon from 'assets/images/small-right-arrow.svg';
import CalendarIcon from 'assets/images/icon-calendar.svg';
import UserDefault from 'assets/images/ico-user-default.svg';
import ReadMoreArrow from 'assets/images/read-more-arrow.svg';

// character length for the content preview
const CONTENT_PREVIEW_LENGTH = 110;
// Votes local storage key
const LOCAL_STORAGE_KEY = 'VENBcnRpY2xlVm90ZXM=';

export default class Article extends React.Component {
  componentDidMount() {
    const { fields } = this.props;
    this.setState({
      upvotes: fields.upvotes || 0,
      downvotes: fields.downvotes || 0,
      showModal: false,
    });
  }

  updateVote(type) {
    let userVotes = localStorage.getItem(LOCAL_STORAGE_KEY);
    userVotes = userVotes ? JSON.parse(userVotes) : {};
    const {
      id, spaceName, environment, preview,
    } = this.props;
    const articleVote = userVotes[id];
    let { upvotes, downvotes } = this.state;
    // Check if user alredy voted on this article?
    if (!articleVote) {
      // No vote yet. Allow the vote...
      upvotes = type === 'up' ? upvotes + 1 : upvotes;
      downvotes = type === 'down' ? downvotes + 1 : downvotes;
      userVotes[id] = type === 'up' ? 1 : -1;
    } else {
      // Vote exists. Handle vote corrections...
      // eslint-disable-next-line default-case
      switch (articleVote) {
        case 1:
          // user already voted up on the article
          if (type === 'down') {
            upvotes -= 1;
            downvotes += 1;
            userVotes[id] = -1;
          } else {
            upvotes -= 1;
            delete userVotes[id];
          }
          break;
        case -1:
          // user already voted down on the article
          if (type === 'up') {
            upvotes += 1;
            downvotes -= 1;
            userVotes[id] = 1;
          } else {
            downvotes -= 1;
            delete userVotes[id];
          }
          break;
      }
    }
    // Store user action
    getService({ spaceName, environment, preview }).articleVote(id, {
      upvotes,
      downvotes,
    })
      .then(() => {
        // Only when Contentful enntry was succesfully updated
        // then we update the local store and the state
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userVotes));
        this.setState({
          upvotes,
          downvotes,
          showModal: true,
        });
      });
  }

  render() {
    const {
      theme, fields, subData, spaceName, environment, preview, EDU_BASE_URL,
    } = this.props;
    const contentfulConfig = {
      spaceName, environment, preview,
    };
    const { upvotes, downvotes, showModal } = this.state || {};

    return (
      <React.Fragment>
        {
          showModal ? (
            <Modal onCancel={() => this.setState({ showModal: false })}>
              <h1 className={theme.modalText}>Thank You for voting!</h1>
            </Modal>
          ) : null
        }
        {/* Banner */}
        <div className={theme.bannerContainer}>
          <div className={theme.contentWrapper}>
            <div className={theme.content}>
              <h1>{fields.title}</h1>
            </div>
          </div>
          {
            fields.featuredImage ? (
              <div className={theme.featuredImage} style={{ backgroundImage: `url(${subData.assets.items[fields.featuredImage.sys.id].fields.file.url})` }} />
            ) : null
          }
        </div>
        <div className={theme.bannerBottomShape} />
        <div
          className={theme.contentContainer}
          style={fixStyle(fields.extraStylesForContainer)}
        >
          {/* Authors */}
          <div className={theme.authorContainer}>
            {
              _.map(fields.contentAuthor, author => (
                <div key={author.sys.id} className={theme.authorWrapper}>
                  {
                    subData.entries.items[author.sys.id].fields.avatar ? (
                      <ContentfulLoader
                        assetIds={subData.entries.items[author.sys.id].fields.avatar.sys.id}
                        preview={preview}
                        spaceName={spaceName}
                        environment={environment}
                        render={avatarData => (
                          <img src={avatarData.assets.items[subData.entries.items[author.sys.id].fields.avatar.sys.id].fields.file.url} alt="article author avatar" className={theme.avatar} />
                        )}
                        renderPlaceholder={LoadingIndicator}
                      />
                    ) : (
                      <UserDefault alt="article author avatar" className={theme.avatar} />
                    )
                  }
                  <span className={theme.name}>
                    {subData.entries.items[author.sys.id].fields.name}
                  </span>
                  {
                    subData.entries.items[author.sys.id].fields.tcHandle ? (
                      <span className={theme.handle}>
                        ({subData.entries.items[author.sys.id].fields.tcHandle})
                      </span>
                    ) : null
                  }
                </div>
              ))
            }
          </div>
          {/* Navi */}
          <div className={theme.titleContainer}>
            <div className={theme.left}>
              <div className={theme.breadcrumbs}>
                <a className={theme.item} href={`${EDU_BASE_URL}`}>Home</a><RightArrowIcon />
              </div>
              <span className={theme.titleItem}>{fields.title}</span>
            </div>
            <div className={theme.right}>
              <CalendarIcon />
              <span>{moment(fields.creationDate).format('MMM DD, YYYY')} . {fields.readTime}</span>
            </div>
          </div>
          {/* Tags */}
          <div className={theme.tagContainer}>
            {
              _.map(fields.tags, tag => (
                <div className={theme.tagItem} key={tag}>{tag}</div>
              ))
            }
          </div>
          {/* Content */}
          <div className={theme.articleContent}>
            <MarkdownRenderer markdown={fields.content} {...contentfulConfig} />
            {
              fields.type === 'Video' && fields.contentUrl ? (
                <YouTubeVideo src={fields.contentUrl} />
              ) : null
            }
          </div>
          {/* Voting */}
          <div className={theme.actionContainer}>
            <div className={theme.action}>
              <div tabIndex={0} role="button" className={theme.circleGreenIcon} onClick={() => this.updateVote('up')} onKeyPress={() => this.updateVote('up')}>
                <GestureIcon />
              </div>
              <span>
                {
                  upvotes
                }
              </span>
            </div>
            <div className={theme.action}>
              <div tabIndex={0} role="button" className={theme.circleRedIcon} onClick={() => this.updateVote('down')} onKeyPress={() => this.updateVote('down')}>
                <GestureIcon />
              </div>
              <span>{downvotes}</span>
            </div>
          </div>
        </div>
        {/* Recommended */}
        {
          fields.recommended ? (
            <div className={theme.recommendedContainer}>
              <div className={theme.recommendedTopShape} />
              <h3 className={theme.recommendedTitle}>Recommended for you</h3>
              <div className={theme.recommended}>
                {
                  _.map(fields.recommended, rec => (
                    <div key={rec.sys.id} className={theme.recommendedCard}>
                      {
                        subData.entries.items[rec.sys.id].fields.featuredImage ? (
                          <ContentfulLoader
                            assetIds={subData.entries.items[rec.sys.id].fields.featuredImage.sys.id}
                            preview={preview}
                            spaceName={spaceName}
                            environment={environment}
                            render={imageData => (
                              <React.Fragment>
                                <div
                                  style={{ backgroundImage: `url(${imageData.assets.items[subData.entries.items[rec.sys.id].fields.featuredImage.sys.id].fields.file.url})` }}
                                  className={theme.recommendedImage}
                                />
                                <div className={theme.recommendedImageBottomShape} />
                              </React.Fragment>
                            )}
                            renderPlaceholder={LoadingIndicator}
                          />
                        ) : null
                      }
                      <h3 className={theme.recommendedCardTitle}>
                        <a href={`${config.TC_EDU_BASE_PATH}${config.TC_EDU_ARTICLES_PATH}/${subData.entries.items[rec.sys.id].fields.title}`}>{subData.entries.items[rec.sys.id].fields.title}</a>
                      </h3>
                      <div className={theme.recommendedCardContent}>
                        {
                          `${subData.entries.items[rec.sys.id].fields.content.substring(0, CONTENT_PREVIEW_LENGTH)}..`
                        }
                      </div>
                      <a href="#" className={theme.readMore}>Read More <ReadMoreArrow /></a>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : null
        }
      </React.Fragment>
    );
  }
}

Article.defaultProps = {
  spaceName: null,
  environment: null,
  EDU_BASE_URL: config.TC_EDU_BASE_PATH,
};

Article.propTypes = {
  id: PT.string.isRequired,
  fields: PT.shape().isRequired,
  theme: PT.shape().isRequired,
  subData: PT.shape().isRequired,
  preview: PT.bool.isRequired,
  spaceName: PT.string,
  environment: PT.string,
  EDU_BASE_URL: PT.string,
};
