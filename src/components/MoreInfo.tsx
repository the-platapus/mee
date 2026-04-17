"use client";

import "./moreinfo.css";

export default function MoreInfo() {
  return (
    <div id="more-info" className="m-0 text-left w-full bg-transparent break-words snap-start">
      <div className="main-caption">
        <h2 className="text-center text-[#d8933f] text-xl font-montserrat font-normal m-0">
          Hi, I&apos;m Abdullah Aamir. I&apos;m into anything that interests me.
        </h2>
      </div>

      <div className="sub-caption glass flex gap-[3vh] p-[3.5%] flex-col sm:flex-row">
        <div className="quotes">
          <h2 className="text-[29px] font-lexend font-normal leading-[47px] m-0 text-[#ec933f] pb-0">
            &quot;Those who look for seashells will find seashells; those who open them will find pearls.&quot;
          </h2>
          <h3 className="text-[15px] font-lexend font-light leading-[30px] m-0 text-[#ec933f] pt-0">
            -Al-Ghazali
          </h3>
        </div>
        <div className="aim">
          <h2 className="text-[69px] font-lexend font-large leading-[1.2] m-0 text-[#ec933f] mb-4">
            I aim
          </h2>
          <h3 className="text-[15px] font-lexend font-light leading-[27px] m-0 text-[#ec933f] pt-0">
            to blur the lines between humans and tech. I believe with good skills
            and practice; we can make great use of technology and fill the voids
            in our daily life. My goal is to find those voids and fulfill them
            where and when needed.
          </h3>
        </div>
      </div>

      <div className="about">
        <div className="paragraph">
          <h2 className="text-[30px] font-lexend font-normal leading-[47px] m-0 text-[#ec933f] pb-4">About me.</h2>
          <h3 className="text-[15px] font-lexend font-light leading-[27px] m-0 text-[#ec933f] pt-0">
            Currently completing my Bachelor&apos;s Degree in Defence Forensics and Cybersecurity, I aim to gather the most experience along the way of my learning path with noticeable grades so I can obtain my spot in the companies that are well known around the world. <br />
            As of this generation, the worth and value of a person is dependent on the skillsets they possess and how keen they are at executing it.
          </h3>
        </div>
      </div>
    </div>
  );
}
