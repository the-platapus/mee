"use client";

import "./moreinfo.css";

interface MoreInfoProps {
  onUnlockProjects?: () => void;
}

export default function MoreInfo({ onUnlockProjects }: MoreInfoProps = {}) {
  return (
    <div id="more-info" className="more-info-container">
      <div className="main-caption">
        <h2>
          Hi, I&apos;m Abdullah Aamir.
        </h2>
        <h2 className="bold-caption">
          I&apos;m into anything that interests me.
        </h2>
      </div>

      <div className="sub-caption glass">
        <div className="quotes">
          <h2>
            &quot;Those who look for seashells will find seashells; those who open them will find pearls.&quot;
          </h2>
          <h3>
            -Al-Ghazali
          </h3>
        </div>
        <div className="aim">
          <h2>
            I aim
          </h2>
          <h3>
            to blur the lines between humans and tech. I believe with good skills
            and practice; we can make great use of technology and fill the voids
            in our daily life. My goal is to find those voids and fulfill them
            where and when needed.
          </h3>
        </div>
      </div>

      <div className="about">
        <div className="paragraph">
          <h2 className="about-title">
            <span>About me.</span>
            {onUnlockProjects && (
              <button
                aria-label="Unlock Projects Section"
                onClick={onUnlockProjects}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                title="View Projects"
                className="about-btn"
              >
                <i className="cursor-pointer icon fa-solid fa-circle-arrow-right about-icon" aria-hidden="true"></i>
              </button>
            )}
          </h2>
          <h3>
            Currently completing my Bachelor&apos;s Degree in Defence Forensics and Cybersecurity, I aim to gather the most experience along the way of my learning path with noticeable grades so I can obtain my spot in the companies that are well known around the world. <br />
            As of this generation, the worth and value of a person is dependent on the skillsets they possess and how keen they are at executing it.
          </h3>
        </div>
      </div>
    </div>
  );
}
