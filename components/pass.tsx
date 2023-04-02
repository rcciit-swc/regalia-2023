import React from "react";
import Image from "next/image";
import RockSticker from "./../public/images/rock-music-sticker.png";
import Confetti from "./../public/images/confetti.png";
import BarCode from "./../public/images/bar-code.png";
const pass = () => {
  return (
    <div className="pass">
      <div className="qr-slip">
        <svg
          className="qr"
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 16 16"
        >
          <path fill="white" d="M6 0H0v6h6V0zM5 5H1V1h4v4z" />
          <path fill="white" d="M2 2h2v2H2V2zM0 16h6v-6H0v6zm1-5h4v4H1v-4z" />
          <path fill="white" d="M2 12h2v2H2v-2zm8-12v6h6V0h-6zm5 5h-4V1h4v4z" />
          <path
            fill="white"
            d="M12 2h2v2h-2V2zM2 7H0v2h3V8H2zm5 2h2v2H7V9zM3 7h2v1H3V7zm6 5H7v1h1v1h1v-1zM6 7v1H5v1h2V7zm2-3h1v2H8V4zm1 4v1h2V7H8v1zM7 6h1v1H7V6zm2 8h2v2H9v-2zm-2 0h1v2H7v-2zm2-3h1v1H9v-1zm0-8V1H8V0H7v4h1V3zm3 11h1v2h-1v-2zm0-2h2v1h-2v-1zm-1 1h1v1h-1v-1zm-1-1h1v1h-1v-1zm4-2v1h1v1h1v-2h-1zm1 3h-1v3h2v-2h-1zm-5-3v1h3V9h-2v1zm2-3v1h2v1h2V7h-2z"
          />
        </svg>
        <Image src={BarCode} alt="" />
      </div>
      <div className="main-slip">
        <header
          className=" pass-name flex justify-center">
          Regalia 2023
        </header>
        <div className="flex flex-row">
          <Image src={RockSticker} alt="" />
          <Image src={Confetti} alt="" />
        </div>
      </div>
    </div>
  );
};

export default pass;
