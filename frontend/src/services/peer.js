// peerService.js
class PeerService {
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] },
      ],
    });

    this.remoteStream = new MediaStream();

    // 🔥 When remote track arrives, add it to remoteStream
    this.peer.ontrack = (event) => {
      console.log("📡 Remote track received:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    this.peer.onsignalingstatechange = () => {
      console.log("📶 Signaling state:", this.peer.signalingState);
    };

    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("❄️ Emitting ICE candidate:", event.candidate);
      }
    };
  }

  async getAnswer(offer) {
    await this.peer.setRemoteDescription(offer);
    const ans = await this.peer.createAnswer();
    await this.peer.setLocalDescription(ans);
    console.log("📝 Answer created:", ans);
    return ans;
  }

  async setRemoteDescription(ans) {
    await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    console.log("✅ Remote description set successfully");
  }

  async getOffer() {
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    console.log("📝 Offer created:", offer);
    return offer;
  }

  addLocalStream(stream) {
    console.log("🎙️ Added local stream tracks");
    stream.getTracks().forEach((track) => this.peer.addTrack(track, stream));
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}

export const peerService = new PeerService();
