import { ProviderSlug } from "#/lib/demos";
import { server } from "#/lib/zitadel";
import Alert, { AlertType } from "#/ui/Alert";
import { createSessionForIdpAndUpdateCookie } from "#/utils/session";
import {
  AddHumanUserRequest,
  IDPInformation,
  RetrieveIdentityProviderIntentResponse,
  user,
  IDPLink,
} from "@zitadel/server";

const PROVIDER_MAPPING: {
  [provider: string]: (rI: IDPInformation) => Partial<AddHumanUserRequest>;
} = {
  [ProviderSlug.GOOGLE]: (idp: IDPInformation) => {
    const idpLink: IDPLink = {
      idpId: idp.idpId,
      userId: idp.userId,
      userName: idp.userName,
    };
    const req: Partial<AddHumanUserRequest> = {
      username: idp.userName,
      email: {
        email: idp.rawInformation?.User?.email,
        isVerified: true,
      },
      // organisation: Organisation | undefined;
      profile: {
        displayName: idp.rawInformation?.User?.name ?? "",
        givenName: idp.rawInformation?.User?.given_name ?? "",
        familyName: idp.rawInformation?.User?.family_name ?? "",
      },
      idpLinks: [idpLink],
    };
    return req;
  },
  [ProviderSlug.GITHUB]: (idp: IDPInformation) => {
    const idpLink: IDPLink = {
      idpId: idp.idpId,
      userId: idp.userId,
      userName: idp.userName,
    };
    const req: Partial<AddHumanUserRequest> = {
      username: idp.userName,
      email: {
        email: idp.rawInformation?.email,
        isVerified: true,
      },
      // organisation: Organisation | undefined;
      profile: {
        displayName: idp.rawInformation?.name ?? "",
        givenName: idp.rawInformation?.name ?? "",
        familyName: idp.rawInformation?.name ?? "",
      },
      idpLinks: [idpLink],
    };
    return req;
  },
};

function retrieveIDP(
  id: string,
  token: string
): Promise<IDPInformation | undefined> {
  const userService = user.getUser(server);
  return userService
    .retrieveIdentityProviderIntent(
      { idpIntentId: id, idpIntentToken: token },
      {}
    )
    .then((resp: RetrieveIdentityProviderIntentResponse) => {
      return resp.idpInformation;
    });
}

function createUser(
  provider: ProviderSlug,
  info: IDPInformation
): Promise<string> {
  const userData = PROVIDER_MAPPING[provider](info);
  const userService = user.getUser(server);
  return userService.addHumanUser(userData, {}).then((resp) => resp.userId);
}

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Record<string | number | symbol, string | undefined>;
  params: { provider: ProviderSlug };
}) {
  const { id, token } = searchParams;
  const { provider } = params;

  if (provider && id && token) {
    return retrieveIDP(id, token)
      .then((information) => {
        if (information) {
          console.log(information);

          // handle login
          if (information.userId) {
            return createSessionForIdpAndUpdateCookie(
              information.userId,
              {
                idpIntentId: id,
                idpIntentToken: token,
              },
              undefined
            )
              .then((session) => {
                return (
                  <div className="flex flex-col items-center space-y-4">
                    <h1>Login successful</h1>
                    <div>You have successfully been loggedIn!</div>
                  </div>
                );
              })
              .catch((error) => {
                throw new Error(error.details);
              });
          } else {
            // handle register

            return createUser(provider, information)
              .then((userId) => {
                return (
                  <div className="flex flex-col items-center space-y-4">
                    <h1>Register successful</h1>
                    <div>You have successfully been registered!</div>
                  </div>
                );
              })
              .catch((error) => {
                throw new Error(error.details);
              });
          }
        } else {
          throw new Error("Could not get user information.");
        }
      })

      .catch((error: Error) => {
        return (
          <div className="flex flex-col items-center space-y-4">
            <h1>Register failed</h1>
            <div className="w-full">
              {
                <Alert type={AlertType.ALERT}>
                  {JSON.stringify(error.message)}
                </Alert>
              }
            </div>
          </div>
        );
      });
  } else {
    return (
      <div className="flex flex-col items-center space-y-4">
        <h1>Register</h1>
        <p className="ztdl-p">No id and token received!</p>
      </div>
    );
  }
}
