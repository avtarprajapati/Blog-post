import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import history from '../../history';
import { fetchPosts, likePost, RemoveLikePost } from '../../actions';

import './PostList.scss';

class PostList extends Component {
  state = {
    active: 'all'
  };
  componentDidMount() {
    this.props.fetchPosts();
  }

  showNav() {
    if (this.props.isSignedIn) {
      return (
        <div className="ui clearing segment navbar">
          <h3 className="ui right floated header" style={{ margin: 'unset' }}>
            <Link to="/post/create" className="ui primary button">
              Create Post
            </Link>
          </h3>
          <h3 className="ui left floated header">
            <button
              className="navBtn"
              onClick={() => this.setState({ active: 'all' })}
            >
              All Post
            </button>
          </h3>
          <h3 className="ui left floated header">
            <button
              className="navBtn"
              onClick={() => this.setState({ active: 'home' })}
            >
              Home
            </button>
          </h3>
          <h3 className="ui left floated header">
            <button
              className="navBtn"
              onClick={() => this.setState({ active: 'own' })}
            >
              Your Post
            </button>
          </h3>
        </div>
      );
    }
  }

  onLikeClick = (id, like, userId) => {
    let hasLike = like.findIndex((uId) => uId === userId);
    if (this.props.isSignedIn) {
      if (hasLike !== -1) {
        this.props.RemoveLikePost(id, userId);
      } else {
        this.props.likePost(id, userId);
      }
    }
  };

  likeColor = (like) => {
    if (!like) return '';
    return like.findIndex((uId) => uId === this.props.userId) !== -1
      ? 'red'
      : '';
  };

  reduceDescriptionLength = (description, limit = 100) => {
    let newDesc = [];
    if (description.length >= limit) {
      description.split(' ').reduce((acc, cur) => {
        if (acc + cur.length <= limit) {
          newDesc.push(cur);
        }
        return acc + cur.length;
      }, 0);
      return `${newDesc.join(' ')} ...`;
    }
    return description;
  };

  renderPostsList(posts = this.props.posts) {
    if (!posts.length) return;

    return posts.map((post) => (
      <div key={post.id} className="ui large feed postList">
        <div className="event">
          <div className="label">
            <img
              src={post.profileImageUrl}
              alt={post.name}
              className="profileImg"
            />
          </div>
          <div className="content">
            <div
              className="summary"
              onClick={() => history.push(`/post/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {post.title}
              <div className="date">{post.date}</div>
            </div>
            <div className="extra text">
              {this.reduceDescriptionLength(post.description)}
            </div>
            <div
              className="meta"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                this.onLikeClick(post.id, post.like, this.props.userId)
              }
            >
              <span className="like">
                <i
                  className="like icon"
                  style={{
                    color: `${this.likeColor(post.like)}`
                  }}
                ></i>
                {post.like.length} Likes
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  renderPost() {
    if (this.props.isSignedIn) {
      if (this.state.active === 'all') {
        return this.renderPostsList(this.props.posts);
      } else if (this.state.active === 'home') {
        if (!this.props.ownFollow)
          return 'No user to follow to get post recently';
        let followPosts = this.props.ownFollow.map((id) =>
          this.props.posts.filter((post) => post.userId === id)
        );
        return this.renderPostsList(_.uniq(followPosts.flat()));
      } else {
        return this.renderPostsList(
          this.props.posts.filter((post) => post.userId === this.props.userId)
        );
      }
    }
    return this.renderPostsList(this.props.posts);
  }

  message = () => {
    if (this.props.posts.length === 0)
      return 'Their is no Post to create post please sign in';
    if (!this.props.posts.length) return 'Loading...';
  };

  render() {
    return (
      <>
        <div>{this.showNav()}</div>
        {this.message()}
        {this.renderPost()}
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    posts: Object.values(state.posts),
    isSignedIn: state.auth.isSignedIn,
    userId: state.auth.userId,
    ownFollow: state.ownFollow[state.auth.userId]
  };
}

export default connect(mapStateToProps, {
  fetchPosts,
  likePost,
  RemoveLikePost
})(PostList);
