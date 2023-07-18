import * as settings from "./v2/settings";
import * as session from "./v2/session";
import * as user from "./v2/user";
import * as management from "./management";

import * as login from "./proto/server/zitadel/settings/v2alpha/login_settings";
import * as password from "./proto/server/zitadel/settings/v2alpha/password_settings";
import * as legal from "./proto/server/zitadel/settings/v2alpha/legal_settings";

export {
  BrandingSettings,
  Theme,
} from "./proto/server/zitadel/settings/v2alpha/branding_settings";

export {
  LoginSettings,
  IdentityProvider,
  IdentityProviderType,
} from "./proto/server/zitadel/settings/v2alpha/login_settings";

export {
  ChallengeKind,
  Challenges,
  Challenges_Passkey,
} from "./proto/server/zitadel/session/v2alpha/challenge";

export {
  Session,
  Factors,
} from "./proto/server/zitadel/session/v2alpha/session";
export {
  ListSessionsResponse,
  GetSessionResponse,
  CreateSessionResponse,
  SetSessionResponse,
  DeleteSessionResponse,
} from "./proto/server/zitadel/session/v2alpha/session_service";
export {
  GetPasswordComplexitySettingsResponse,
  GetBrandingSettingsResponse,
  GetLegalAndSupportSettingsResponse,
  GetGeneralSettingsResponse,
  GetLoginSettingsResponse,
  GetLoginSettingsRequest,
  GetActiveIdentityProvidersResponse,
  GetActiveIdentityProvidersRequest,
} from "./proto/server/zitadel/settings/v2alpha/settings_service";
export {
  AddHumanUserResponse,
  VerifyEmailResponse,
  VerifyPasskeyRegistrationRequest,
  VerifyPasskeyRegistrationResponse,
  RegisterPasskeyRequest,
  RegisterPasskeyResponse,
  CreatePasskeyRegistrationLinkResponse,
  CreatePasskeyRegistrationLinkRequest,
  ListAuthenticationMethodTypesResponse,
  ListAuthenticationMethodTypesRequest,
  AuthenticationMethodType,
} from "./proto/server/zitadel/user/v2alpha/user_service";
export {
  SetHumanPasswordResponse,
  SetHumanPasswordRequest,
} from "./proto/server/zitadel/management";
export * from "./proto/server/zitadel/idp";
export { type LegalAndSupportSettings } from "./proto/server/zitadel/settings/v2alpha/legal_settings";
export { type PasswordComplexitySettings } from "./proto/server/zitadel/settings/v2alpha/password_settings";
export { type ResourceOwnerType } from "./proto/server/zitadel/settings/v2alpha/settings";

import {
  getServers,
  initializeServer,
  ZitadelServer,
  ZitadelServerOptions,
} from "./server";
export * from "./middleware";

export {
  getServers,
  ZitadelServer,
  type ZitadelServerOptions,
  initializeServer,
  user,
  management,
  session,
  settings,
  login,
  password,
  legal,
};
