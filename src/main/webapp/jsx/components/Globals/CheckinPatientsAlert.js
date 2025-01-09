import React, { useState, useRef, useEffect } from "react";
import SockJsClient from "react-stomp";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { wsUrl } from "../../../api";
import "./CheckedInPatientsAlert.css";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { Fab } from "@material-ui/core";

const CheckedInPatientsAlert = () => {
  const lastToastRef = useRef(null);
  const hiddenButtonRef = useRef(null); // Reference to the hidden button

  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRefs = useRef({
    connected: new Audio(`${process.env.PUBLIC_URL}/incoming.wav`),
    messageReceived: new Audio(`${process.env.PUBLIC_URL}/incoming.wav`),
    disconnected: new Audio(`${process.env.PUBLIC_URL}/incoming.wav`),
  });

  useEffect(() => {
    // Simulate a user interaction by programmatically clicking the hidden button
    if (hiddenButtonRef.current) {
      hiddenButtonRef.current.click();
    }

    // Preload sounds when enabled
    if (soundEnabled) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.load();
      });
    }
  }, [soundEnabled]);

  const playSound = (soundKey) => {
    if (soundEnabled) {
      const audio = audioRefs.current[soundKey];
      if (audio) {
        audio.play().catch((err) => {
          console.warn("Audio playback failed:", err);
        });
      }
    }
  };

  const showToast = (message, soundKey) => {
    if (lastToastRef.current !== message) {
      lastToastRef.current = message;
      toast(
        <div className="toast-content">
          <p className="toast-message">{message}</p>
        </div>,
        { autoClose: 5000, className: "light-toast" }
      );
    }
    playSound(soundKey);
  };

  const onConnected = () => {
    console.log("Connected to the server");
  };

  const onMessageReceived = (msg) => {
    if (msg && msg?.toLowerCase()?.includes("check") && msg?.toLowerCase()?.includes("pmtct")) {
      showToast(msg, "messageReceived");
    }
  };

  const onDisconnected = () => {
    console.log("Disconnected from the server");
  };

  return (
    <div>
      <Fab
        color="primary"
        aria-label="toggle-sound"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 1000,
          background: "white",
          color: "#014d88",
          height: "35px",
          width: "35px",
        }}
        onClick={() => setSoundEnabled((prev) => !prev)}
      >
        {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
      </Fab>

      <SockJsClient
        url={wsUrl}
        topics={["/topic/checking-in-out-process"]}
        onConnect={onConnected}
        onDisconnect={onDisconnected}
        onMessage={onMessageReceived}
        debug={true}
      />

      <button
        ref={hiddenButtonRef}
        style={{ display: "none" }}
        onClick={() => playSound("connected")}
      >
        Hidden Play Button
      </button>
    </div>
  );
};

export default CheckedInPatientsAlert;
