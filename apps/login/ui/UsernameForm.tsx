"use client";

import { useEffect, useState } from "react";
import { Button, ButtonVariants } from "./Button";
import { TextInput } from "./Input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";
import { LoginSettings } from "@zitadel/server";

type Inputs = {
  loginName: string;
};

type Props = {
  loginSettings: LoginSettings | undefined;
  loginName: string | undefined;
  submit: boolean;
};

export default function UsernameForm({
  loginSettings,
  loginName,
  submit,
}: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onBlur",
    defaultValues: {
      loginName: loginName ? loginName : "",
    },
  });

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function submitLoginName(values: Inputs) {
    setLoading(true);
    const res = await fetch("/api/loginname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginName: values.loginName,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      throw new Error("Failed to load authentication methods");
    }
    return res.json();
  }

  async function setLoginNameAndGetAuthMethods(values: Inputs) {
    return submitLoginName(values).then((response) => {
      if (response.authMethodTypes.length == 1) {
        const method = response.authMethodTypes[0];
        switch (method) {
          case 1: //AuthenticationMethodType.AUTHENTICATION_METHOD_TYPE_PASSWORD:
            return router.push(
              "/password?" +
                new URLSearchParams(
                  loginSettings?.passkeysType === 1
                    ? {
                        loginName: values.loginName,
                        promptPasswordless: `true`, // PasskeysType.PASSKEYS_TYPE_ALLOWED,
                      }
                    : { loginName: values.loginName }
                )
            );
          case 2: // AuthenticationMethodType.AUTHENTICATION_METHOD_TYPE_PASSKEY
            return router.push(
              "/passkey/login?" +
                new URLSearchParams({ loginName: values.loginName })
            );
          default:
            return router.push(
              "/password?" +
                new URLSearchParams(
                  loginSettings?.passkeysType === 1
                    ? {
                        loginName: values.loginName,
                        promptPasswordless: `true`, // PasskeysType.PASSKEYS_TYPE_ALLOWED,
                      }
                    : { loginName: values.loginName }
                )
            );
        }
      } else if (
        response.authMethodTypes &&
        response.authMethodTypes.length === 0
      ) {
        setError(
          "User has no available authentication methods. Contact your administrator to setup authentication for the requested user."
        );
      } else {
        // prefer passkey in favor of other methods
        if (response.authMethodTypes.includes(2)) {
          return router.push(
            "/passkey/login?" +
              new URLSearchParams({
                loginName: values.loginName,
                altPassword: `${response.authMethodTypes.includes(1)}`, // show alternative password option
              })
          );
        }
      }
    });
  }

  const { errors } = formState;

  useEffect(() => {
    if (submit && loginName) {
      // When we navigate to this page, we always want to be redirected if submit is true and the parameters are valid.
      setLoginNameAndGetAuthMethods({ loginName });
    }
  }, []);

  return (
    <form className="w-full">
      <div className="">
        <TextInput
          type="text"
          autoComplete="username"
          {...register("loginName", { required: "This field is required" })}
          label="Loginname"
          //   error={errors.username?.message as string}
        />
      </div>

      <div className="mt-8 flex w-full flex-row items-center">
        {/* <Button type="button" variant={ButtonVariants.Secondary}>
          back
        </Button> */}
        <span className="flex-grow"></span>
        <Button
          type="submit"
          className="self-end"
          variant={ButtonVariants.Primary}
          disabled={loading || !formState.isValid}
          onClick={handleSubmit(setLoginNameAndGetAuthMethods)}
        >
          {loading && <Spinner className="h-5 w-5 mr-2" />}
          continue
        </Button>
      </div>
    </form>
  );
}
