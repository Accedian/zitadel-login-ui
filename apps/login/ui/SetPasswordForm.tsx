"use client";

import { PasswordComplexitySettings } from "@zitadel/server";
import PasswordComplexity from "./PasswordComplexity";
import { useState } from "react";
import { Button, ButtonVariants } from "./Button";
import { TextInput } from "./Input";
import { FieldValues, useForm } from "react-hook-form";
import {
  lowerCaseValidator,
  numberValidator,
  symbolValidator,
  upperCaseValidator,
} from "#/utils/validators";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

type Inputs =
  | {
      password: string;
      confirmPassword: string;
    }
  | FieldValues;

type Props = {
  passwordComplexitySettings: PasswordComplexitySettings;
  email: string;
  firstname: string;
  lastname: string;
};

export default function SetPasswordForm({
  passwordComplexitySettings,
  email,
  firstname,
  lastname,
}: Props) {
  const { register, handleSubmit, watch, formState } = useForm<Inputs>({
    mode: "onBlur",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  async function submitRegister(values: Inputs) {
    setLoading(true);
    const res = await fetch("/registeruser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        firstName: firstname,
        lastName: lastname,
        password: values.password,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      throw new Error("Failed to register user");
    }
    return res.json();
  }

  async function createSessionWithLoginNameAndPassword(
    loginName: string,
    password: string
  ) {
    setLoading(true);
    const res = await fetch("/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginName: loginName,
        password: password,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      throw new Error("Failed to set user");
    }
    return res.json();
  }

  function submitAndLink(value: Inputs): Promise<boolean | void> {
    return submitRegister(value).then((humanResponse: any) => {
      return createSessionWithLoginNameAndPassword(email, value.password).then(
        () => {
          return router.push(`/verify?userID=${humanResponse.userId}`);
        }
      );
    });
  }

  const { errors } = formState;

  const watchPassword = watch("password", "");
  const watchConfirmPassword = watch("confirmPassword", "");

  const [tosAndPolicyAccepted, setTosAndPolicyAccepted] = useState(false);

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
        <div className="">
          <TextInput
            type="password"
            autoComplete="new-password"
            required
            {...register("password", {
              required: "You have to provide a password!",
            })}
            label="Password"
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

      <div className="mt-8 flex w-full flex-row items-center justify-between">
        <Button type="button" variant={ButtonVariants.Secondary}>
          back
        </Button>
        <Button
          type="submit"
          variant={ButtonVariants.Primary}
          disabled={
            loading ||
            !policyIsValid ||
            !formState.isValid ||
            watchPassword !== watchConfirmPassword
          }
          onClick={handleSubmit(submitAndLink)}
        >
          {loading && <Spinner className="h-5 w-5 mr-2" />}
          continue
        </Button>
      </div>
    </form>
  );
}
