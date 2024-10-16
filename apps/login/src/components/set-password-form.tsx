"use client";

import {
  lowerCaseValidator,
  numberValidator,
  symbolValidator,
  upperCaseValidator,
} from "@/helpers/validators";
import { changePassword } from "@/lib/server/password";
import { PasswordComplexitySettings } from "@zitadel/proto/zitadel/settings/v2/password_settings_pb";
import { SetPasswordResponse } from "@zitadel/proto/zitadel/user/v2/user_service_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Alert } from "./alert";
import { BackButton } from "./back-button";
import { Button, ButtonVariants } from "./button";
import { TextInput } from "./input";
import { PasswordComplexity } from "./password-complexity";
import { Spinner } from "./spinner";

type Inputs =
  | {
      code: string;
      password: string;
      confirmPassword: string;
    }
  | FieldValues;

type Props = {
  code?: string;
  passwordComplexitySettings: PasswordComplexitySettings;
  loginName: string;
  userId: string;
  organization?: string;
  authRequestId?: string;
};

export function SetPasswordForm({
  passwordComplexitySettings,
  organization,
  authRequestId,
  loginName,
  userId,
  code,
}: Props) {
  const t = useTranslations("password");

  const { register, handleSubmit, watch, formState } = useForm<Inputs>({
    mode: "onBlur",
    defaultValues: {
      code: code ?? "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  async function submitRegister(values: Inputs) {
    setLoading(true);
    const response = await changePassword({
      userId: userId,
      password: values.password,
      code: values.code,
    }).catch(() => {
      setError("Could not register user");
    });

    if (response && "error" in response) {
      setError(response.error);
    }

    setLoading(false);

    if (!response) {
      setError("Could not register user");
      return;
    }

    const userResponse = response as SetPasswordResponse & {
      sessionId: string;
    };

    const params = new URLSearchParams({});

    if (loginName) {
      params.append("loginName", loginName);
    }
    if (organization) {
      params.append("organization", organization);
    }

    // skip verification for now as it is an app based flow
    // return router.push(`/verify?` + params);

    // check for mfa force to continue with mfa setup

    if (authRequestId && userResponse.sessionId) {
      if (authRequestId) {
        params.append("authRequest", authRequestId);
      }
      return router.push(`/login?` + params);
    } else {
      if (authRequestId) {
        params.append("authRequestId", authRequestId);
      }
      return router.push(`/signedin?` + params);
    }
  }

  const { errors } = formState;

  const watchPassword = watch("password", "");
  const watchConfirmPassword = watch("confirmPassword", "");

  const hasMinLength =
    passwordComplexitySettings &&
    watchPassword?.length >= passwordComplexitySettings.minLength;
  const hasSymbol = symbolValidator(watchPassword);
  const hasNumber = numberValidator(watchPassword);
  const hasUppercase = upperCaseValidator(watchPassword);
  const hasLowercase = lowerCaseValidator(watchPassword);

  const policyIsValid =
    passwordComplexitySettings &&
    (passwordComplexitySettings.requiresLowercase ? hasLowercase : true) &&
    (passwordComplexitySettings.requiresNumber ? hasNumber : true) &&
    (passwordComplexitySettings.requiresUppercase ? hasUppercase : true) &&
    (passwordComplexitySettings.requiresSymbol ? hasSymbol : true) &&
    hasMinLength;

  return (
    <form className="w-full">
      <div className="pt-4 grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-row items-end">
          <div className="flex-1">
            <TextInput
              type="text"
              required
              {...register("code", {
                required: "This field is required",
              })}
              label="Code"
              error={errors.code?.message as string}
            />
          </div>
          <div className="ml-4 mb-1">
            <Button variant={ButtonVariants.Secondary}>
              {t("set.resend")}
            </Button>
          </div>
        </div>
        <div className="">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            {...register("password", {
              required: "You have to provide a password!",
            })}
            label="New Password"
            error={errors.password?.message as string}
          />
        </div>
        <div className="">
          <TextInput
            type="password"
            required
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "This field is required",
            })}
            label="Confirm Password"
            error={errors.confirmPassword?.message as string}
          />
        </div>
      </div>

      {passwordComplexitySettings && (
        <PasswordComplexity
          passwordComplexitySettings={passwordComplexitySettings}
          password={watchPassword}
          equals={!!watchPassword && watchPassword === watchConfirmPassword}
        />
      )}

      {error && <Alert>{error}</Alert>}

      <div className="mt-8 flex w-full flex-row items-center justify-between">
        <BackButton />
        <Button
          type="submit"
          variant={ButtonVariants.Primary}
          disabled={
            loading ||
            !policyIsValid ||
            !formState.isValid ||
            watchPassword !== watchConfirmPassword
          }
          onClick={handleSubmit(submitRegister)}
        >
          {loading && <Spinner className="h-5 w-5 mr-2" />}
          {t("set.submit")}
        </Button>
      </div>
    </form>
  );
}
