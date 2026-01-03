// src/services/peerService.js

class PeerService {
  constructor() {
    // Create a new RTCPeerConnection
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    console.log("✅ Peer connection created");
  }

  // Add local media tracks to the peer connection
  addLocalTracks(stream) {
    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });
  }

  // Create and set local offer
  async getOffer() {
    try {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      console.log("📤 Created and set local offer");
      return offer;
    } catch (err) {
      console.error("❌ Error creating offer:", err);
    }
  }

  // Create and set local answer
  async getAnswer(offer) {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans);
      console.log("📥 Created and set local answer");
      return ans;
    } catch (err) {
      console.error("❌ Error creating answer:", err);
    }
  }

  // Set remote description (when answer received)
  async setLocalDescription(ans) {
    try {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      console.log("✅ Remote description set");
    } catch (err) {
      console.error("❌ Error setting remote description:", err);
    }
  }

  // Listen for remote tracks
  onTrack(callback) {
    this.peer.ontrack = (event) => {
      console.log("🎥 Remote track received");
      callback(event);
    };
  }

  // Add incoming ICE candidate
  async addIceCandidate(candidate) {
    try {
      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("🧊 Added remote ICE candidate");
    } catch (err) {
      console.error("❌ Error adding ICE candidate:", err);
    }
  }
}

// Export a **single instance**
const peerService = new PeerService();
export default peerService;
