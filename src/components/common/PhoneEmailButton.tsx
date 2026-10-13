import React, { useEffect, useRef } from 'react';
import { PHONE_EMAIL_CLIENT_ID } from '../../utils/phoneEmailConfig';

// phone.email's widget: a <script> placed inside a .pe_signin_button div, which the
// script then replaces with the real button. React never executes a <script> written
// as JSX, so it is created and appended imperatively here.
const SCRIPT_SRC = 'https://www.phone.email/sign_in_button_v1.js';

declare global {
  interface Window {
    phoneEmailListener?: (userObj: { user_json_url: string }) => void;
  }
}

export const PhoneEmailButton: React.FC<{
  onVerified: (userJsonUrl: string) => void;
  disabled?: boolean;
}> = ({ onVerified, disabled }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onVerifiedRef = useRef(onVerified);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!PHONE_EMAIL_CLIENT_ID || !mount) return;

    // The widget calls this global once the number is verified.
    window.phoneEmailListener = (userObj) => {
      if (userObj?.user_json_url) onVerifiedRef.current(userObj.user_json_url);
    };

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    mount.appendChild(script);

    return () => {
      delete window.phoneEmailListener;
      mount.replaceChildren();
    };
  }, []);

  if (!PHONE_EMAIL_CLIENT_ID) return null;

  return (
    <div
      ref={mountRef}
      className={`pe_signin_button flex justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      data-client-id={PHONE_EMAIL_CLIENT_ID}
    />
  );
};
