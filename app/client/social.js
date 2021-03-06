import React from 'react'
import ReactDOM from 'react-dom'
import {ShareButtons, ShareCounts, generateShareIcon} from 'react-share';


const {
    FacebookShareButton,
    GooglePlusShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    PinterestShareButton,
    VKShareButton,
    OKShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    RedditShareButton,
    EmailShareButton,
} = ShareButtons;

const {
    FacebookShareCount,
    GooglePlusShareCount,
    LinkedinShareCount,
    PinterestShareCount,
    VKShareCount,
    OKShareCount,
    RedditShareCount,
} = ShareCounts;

const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const GooglePlusIcon = generateShareIcon('google');
const LinkedinIcon = generateShareIcon('linkedin');
const PinterestIcon = generateShareIcon('pinterest');
const VKIcon = generateShareIcon('vk');
const OKIcon = generateShareIcon('ok');
const TelegramIcon = generateShareIcon('telegram');
const WhatsappIcon = generateShareIcon('whatsapp');
const RedditIcon = generateShareIcon('reddit');
const EmailIcon = generateShareIcon('email');


class SocialButtons extends React.Component {
  componentDidMount() {
    $('div.button-container').on('click', e => {
        let dest = $(e.target.closest('div.button-container')).data('dest')
        gtag('event', `profile-share-${dest}`, {
            'event_category': 'engagement',
            'event_label': `Profile Shared (${dest})`
        })
    })
  }

  render() {
    const shareUrl = this.props.shareUrl
    const title = this.props.title

    return (
        <div className={this.props.className || "social-sharing"}>
            <div className="clearfix">
                <div className="button-container clearfix" data-dest="facebook">
                    <FacebookShareButton
                        url={shareUrl}
                        quote={title}
                        className="share-button">
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                    <FacebookShareCount
                        url={shareUrl}
                        className="share-count">
                        {count => count}
                    </FacebookShareCount>
                </div>

                <div className="button-container clearfix" data-dest="twitter">
                    <TwitterShareButton
                        url={shareUrl}
                        title={`${title} #letsresume`}
                        className="share-button">
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>
                    <div className="share-count">&nbsp;</div>
                </div>

                <div className="button-container clearfix" data-dest="google_plus">
                    <GooglePlusShareButton
                        url={shareUrl}
                        className="share-button">
                        <GooglePlusIcon size={32} round />
                    </GooglePlusShareButton>
                    <GooglePlusShareCount
                        url={shareUrl}
                        className="share-count">
                        {count => count}
                    </GooglePlusShareCount>
                </div>

                <div className="button-container clearfix" data-dest="linkedin">
                    <LinkedinShareButton
                        url={shareUrl}
                        title={title}
                        windowWidth={750}
                        windowHeight={600}
                        className="share-button">
                        <LinkedinIcon size={32} round />
                    </LinkedinShareButton>
                    <LinkedinShareCount
                        url={shareUrl}
                        className="share-count">
                        {count => count}
                    </LinkedinShareCount>
                </div>
            </div>
        </div>)
    }
}

export default SocialButtons
