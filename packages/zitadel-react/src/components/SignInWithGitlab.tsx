import * as React from "react";

export interface SignInWithGitlabProps {
  children?: React.ReactNode;
}

export function SignInWithGitlab(props: SignInWithGitlabProps) {
  return (
    <div className="ui-flex ui-flex-row ui-items-center ui-bg-white ui-text-black dark:ui-bg-transparent dark:ui-text-white border ui-border-divider-light dark:ui-border-divider-dark rounded-md px-4 text-sm">
      <div className="ui-h-12 ui-w-12 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={25}
          height={24}
          fill="none"
          {...props}
        >
          <path
            fill="#e24329"
            d="m24.507 9.5-.034-.09L21.082.562a.896.896 0 0 0-1.694.091l-2.29 7.01H7.825L5.535.653a.898.898 0 0 0-1.694-.09L.451 9.411.416 9.5a6.297 6.297 0 0 0 2.09 7.278l.012.01.03.022 5.16 3.867 2.56 1.935 1.554 1.176a1.051 1.051 0 0 0 1.268 0l1.555-1.176 2.56-1.935 5.197-3.89.014-.01A6.297 6.297 0 0 0 24.507 9.5z"
          />
          <path
            fill="#fc6d26"
            d="m24.507 9.5-.034-.09a11.44 11.44 0 0 0-4.56 2.051l-7.447 5.632 4.742 3.584 5.197-3.89.014-.01A6.297 6.297 0 0 0 24.507 9.5z"
          />
          <path
            fill="#fca326"
            d="m7.707 20.677 2.56 1.935 1.555 1.176a1.051 1.051 0 0 0 1.268 0l1.555-1.176 2.56-1.935-4.743-3.584-4.755 3.584z"
          />
          <path
            fill="#fc6d26"
            d="M5.01 11.461a11.43 11.43 0 0 0-4.56-2.05L.416 9.5a6.297 6.297 0 0 0 2.09 7.278l.012.01.03.022 5.16 3.867 4.745-3.584-7.444-5.632z"
          />
        </svg>
      </div>
      <span className="ui-ml-4">Sign in with Gitlab</span>
    </div>
  );
}

SignInWithGitlab.displayName = "SignInWithGitlab";
