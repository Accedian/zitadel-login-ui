"use client";
import { ReactNode, useState } from "react";

import {
  SignInWithGitlab,
  SignInWithAzureAD,
  SignInWithGoogle,
  SignInWithGithub,
} from "@zitadel/react";
import { useRouter } from "next/navigation";
import { ProviderSlug } from "#/lib/demos";
import Alert from "./Alert";

export interface SignInWithIDPProps {
  children?: ReactNode;
  host: string;
  identityProviders: any[];
  authRequestId?: string;
  startIDPFlowPath?: (idpId: string) => string;
}

const START_IDP_FLOW_PATH = (idpId: string) =>
  `/v2beta/users/idps/${idpId}/start`;

export function SignInWithIDP({
  host,
  identityProviders,
  authRequestId,
  startIDPFlowPath = START_IDP_FLOW_PATH,
}: SignInWithIDPProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  async function startFlow(idpId: string, provider: ProviderSlug) {
    setLoading(true);

    const res = await fetch("/api/idp/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idpId,
        successUrl: authRequestId
          ? `${host}/idp/${provider}/success?` +
            new URLSearchParams({ authRequestId })
          : `${host}/idp/${provider}/success`,
        failureUrl: `${host}/idp/${provider}/failure`,
      }),
    });

    const response = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(response.details);
      return Promise.reject(response.details);
    }
    return response;
  }

  return (
    <div className="flex flex-col w-full space-y-2 text-sm">
      {identityProviders &&
        identityProviders.map((idp, i) => {
          switch (idp.type) {
            case 6: // IdentityProviderType.IDENTITY_PROVIDER_TYPE_GITHUB:
              return (
                <SignInWithGithub
                  key={`idp-${i}`}
                  onClick={() =>
                    startFlow(idp.id, ProviderSlug.GITHUB).then(
                      ({ authUrl }) => {
                        router.push(authUrl);
                      }
                    )
                  }
                ></SignInWithGithub>
              );
            case 7: // IdentityProviderType.IDENTITY_PROVIDER_TYPE_GITHUB_ES:
              return (
                <SignInWithGithub
                  key={`idp-${i}`}
                  onClick={() => alert("TODO: unimplemented")}
                ></SignInWithGithub>
              );
            case 5: // IdentityProviderType.IDENTITY_PROVIDER_TYPE_AZURE_AD:
              return (
                <SignInWithAzureAD
                  key={`idp-${i}`}
                  onClick={() => alert("TODO: unimplemented")}
                ></SignInWithAzureAD>
              );
            case 10: // IdentityProviderType.IDENTITY_PROVIDER_TYPE_GOOGLE:
              return (
                <SignInWithGoogle
                  key={`idp-${i}`}
                  e2e="google"
                  name={idp.name}
                  onClick={() =>
                    startFlow(idp.id, ProviderSlug.GOOGLE).then(
                      ({ authUrl }) => {
                        router.push(authUrl);
                      }
                    )
                  }
                ></SignInWithGoogle>
              );
            case 8: // IdentityProviderType.IDENTITY_PROVIDER_TYPE_GITLAB:
              return (
                <SignInWithGitlab
                  key={`idp-${i}`}
                  onClick={() => alert("TODO: unimplemented")}
                ></SignInWithGitlab>
              );
            case 9: //IdentityProviderType.IDENTITY_PROVIDER_TYPE_GITLAB_SELF_HOSTED:
              return (
                <SignInWithGitlab
                  key={`idp-${i}`}
                  onClick={() => alert("TODO: unimplemented")}
                ></SignInWithGitlab>
              );
            default:
              return null;
          }
        })}
      {error && (
        <div className="py-4">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}

SignInWithIDP.displayName = "SignInWithIDP";
