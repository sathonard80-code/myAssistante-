const axios = require('axios');

class TikTokAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = process.env.TIKTOK_API_BASE_URL || 'https://open.tiktokapis.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getUserInfo() {
    try {
      const response = await this.client.get('/user/info');
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  async getVideoStats(videoId) {
    try {
      const response = await this.client.get(`/video/${videoId}/query`, {
        params: {
          fields: 'id,title,create_time,view_count,like_count,comment_count,share_count'
        }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get video stats: ${error.message}`);
    }
  }

  async createVideo(videoData) {
    try {
      const response = await this.client.post('/video/upload', videoData);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  async publishVideo(uploadId, caption) {
    try {
      const response = await this.client.post('/video/publish', {
        upload_id: uploadId,
        caption: caption,
        post_mode: 'PUBLISH_MODE_IMMEDIATE'
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to publish video: ${error.message}`);
    }
  }

  async getComments(videoId, cursor = '') {
    try {
      const params = { video_id: videoId };
      if (cursor) params.cursor = cursor;

      const response = await this.client.get('/video/comments', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  async replyToComment(commentId, text) {
    try {
      const response = await this.client.post('/comment/reply', {
        comment_id: commentId,
        content: text
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to reply to comment: ${error.message}`);
    }
  }

  async getVideos(cursor = '') {
    try {
      const params = {
        fields: 'id,title,create_time,view_count,like_count,comment_count,share_count'
      };
      if (cursor) params.cursor = cursor;

      const response = await this.client.get('/user/videos', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get videos: ${error.message}`);
    }
  }
}

module.exports = TikTokAPI;
