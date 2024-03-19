"use server";

import {
  createSessionForLoginname,
  createSessionForUserIdAndIdpIntent,
  getSession,
  server,
  setSession,
} from "#/lib/zitadel";
import {
  SessionCookie,
  addSessionToCookie,
  updateSessionCookie,
} from "./cookies";
import { Session, Challenges, RequestChallenges } from "@zitadel/server";

export async function createSessionAndUpdateCookie(
  loginName: string,
  password: string | undefined,
  challenges: RequestChallenges | undefined,
  authRequestId: string | undefined
): Promise<Session> {
  const createdSession = await createSessionForLoginname(
    server,
    loginName,
    password,
    challenges
  );

  if (createdSession) {
    return getSession(
      server,
      createdSession.sessionId,
      createdSession.sessionToken
    ).then((response) => {
      if (response?.session && response.session?.factors?.user?.loginName) {
        const sessionCookie: SessionCookie = {
          id: createdSession.sessionId,
          token: createdSession.sessionToken,
          creationDate: response.session.creationDate?.toString() ?? "",
          expirationDate: (response.session.expirationDate ?? "")?.toString(),
          changeDate: response.session.changeDate?.toString() ?? "",
          loginName: response.session?.factors?.user?.loginName ?? "",
        };

        if (authRequestId) {
          sessionCookie.authRequestId = authRequestId;
        }

        return addSessionToCookie(sessionCookie).then(() => {
          return response.session as Session;
        });
      } else {
        throw "could not get session or session does not have loginName";
      }
    });
  } else {
    throw "Could not create session";
  }
}

export async function createSessionForIdpAndUpdateCookie(
  userId: string,
  idpIntent: {
    idpIntentId?: string | undefined;
    idpIntentToken?: string | undefined;
  },
  authRequestId: string | undefined
): Promise<Session> {
  const createdSession = await createSessionForUserIdAndIdpIntent(
    server,
    userId,
    idpIntent
  );

  if (createdSession) {
    return getSession(
      server,
      createdSession.sessionId,
      createdSession.sessionToken
    ).then((response) => {
      if (response?.session && response.session?.factors?.user?.loginName) {
        const sessionCookie: SessionCookie = {
          id: createdSession.sessionId,
          token: createdSession.sessionToken,
          creationDate: response.session.creationDate?.toString() ?? "",
          expirationDate: (response.session.expirationDate ?? "")?.toString(),
          changeDate: response.session.changeDate?.toString() ?? "",
          loginName: response.session?.factors?.user?.loginName ?? "",
        };

        if (authRequestId) {
          sessionCookie.authRequestId = authRequestId;
        }

        return addSessionToCookie(sessionCookie).then(() => {
          return response.session as Session;
        });
      } else {
        throw "could not get session or session does not have loginName";
      }
    });
  } else {
    throw "Could not create session";
  }
}

export type SessionWithChallenges = Session & {
  challenges: Challenges | undefined;
};

export async function setSessionAndUpdateCookie(
  recentCookie: SessionCookie,
  password: string | undefined,
  webAuthN: { credentialAssertionData: any } | undefined,
  challenges: RequestChallenges | undefined,
  authRequestId: string | undefined
): Promise<SessionWithChallenges> {
  return setSession(
    server,
    recentCookie.id,
    recentCookie.token,
    password,
    webAuthN,
    challenges
  ).then((updatedSession) => {
    if (updatedSession) {
      const sessionCookie: SessionCookie = {
        id: recentCookie.id,
        token: updatedSession.sessionToken,
        creationDate: recentCookie.creationDate,
        expirationDate: recentCookie.expirationDate,
        changeDate: updatedSession.details?.changeDate?.toString() ?? "",
        loginName: recentCookie.loginName,
      };

      if (authRequestId) {
        sessionCookie.authRequestId = authRequestId;
      }

      return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
        // TODO: remove
        getSession(server, sessionCookie.id, sessionCookie.token).then(
          (response) => {
            if (
              response?.session &&
              response.session.factors?.user?.loginName
            ) {
              const { session } = response;
              const newCookie: SessionCookie = {
                id: sessionCookie.id,
                token: updatedSession.sessionToken,
                creationDate: sessionCookie.creationDate,
                expirationDate: sessionCookie.expirationDate,
                changeDate: session.changeDate?.toString() ?? "",
                loginName: session.factors?.user?.loginName ?? "",
              };

              if (sessionCookie.authRequestId) {
                newCookie.authRequestId = sessionCookie.authRequestId;
              }

              return updateSessionCookie(sessionCookie.id, newCookie).then(
                () => {
                  return { challenges: updatedSession.challenges, ...session };
                }
              );
            } else {
              throw "could not get session or session does not have loginName";
            }
          }
        )
      );
    } else {
      throw "Session not be set";
    }
  });
}
