"use client";

import { LegalAndSupportSettings } from "@zitadel/server";
import { useState } from "react";
import { Button, ButtonVariants } from "./Button";
import { TextInput } from "./Input";
import { PrivacyPolicyCheckboxes } from "./PrivacyPolicyCheckboxes";
import { FieldValues, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";
import AuthenticationMethodRadio, {
  methods,
} from "./AuthenticationMethodRadio";

type Inputs =
  | {
      firstname: string;
      lastname: string;
      email: string;
    }
  | FieldValues;

type Props = {
  legal: LegalAndSupportSettings;
};

export default function RegisterFormWithoutPassword({ legal }: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onBlur",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState(methods[0]);

  const router = useRouter();

  async function submitAndRegister(values: Inputs) {
    setLoading(true);
    const res = await fetch("/registeruser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        firstName: values.firstname,
        lastName: values.lastname,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      throw new Error("Failed to register user");
    }
    return res.json();
  }

  async function createSessionWithLoginName(loginName: string) {
    setLoading(true);
    const res = await fetch("/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginName: loginName,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      throw new Error("Failed to set user");
    }
    return res.json();
  }

  async function submitAndContinue(
    value: Inputs,
    withPassword: boolean = false
  ) {
    return withPassword
      ? router.push(`/register?` + new URLSearchParams(value))
      : submitAndRegister(value).then((resp: any) => {
          createSessionWithLoginName(value.email).then(({ factors }) => {
            return router.push(
              `/passkey/add?` +
                new URLSearchParams({ loginName: factors.user.loginName })
            );
          });
        });
    //   .then((resp: any) => {
    //       return router.push(`/verify?userID=${resp.userId}`);
    //     });
  }

  const { errors } = formState;

  const [tosAndPolicyAccepted, setTosAndPolicyAccepted] = useState(false);

  return (
    <form className="w-full">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="">
          <TextInput
            type="firstname"
            autoComplete="firstname"
            required
            {...register("firstname", { required: "This field is required" })}
            label="First name"
            error={errors.firstname?.message as string}
          />
        </div>
        <div className="">
          <TextInput
            type="lastname"
            autoComplete="lastname"
            required
            {...register("lastname", { required: "This field is required" })}
            label="Last name"
            error={errors.lastname?.message as string}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            type="email"
            autoComplete="email"
            required
            {...register("email", { required: "This field is required" })}
            label="E-mail"
            error={errors.email?.message as string}
          />
        </div>
      </div>

      {legal && (
        <PrivacyPolicyCheckboxes
          legal={legal}
          onChange={setTosAndPolicyAccepted}
        />
      )}

      <p className="mt-4 ztdl-p mb-6 block text-text-light-secondary-500 dark:text-text-dark-secondary-500">
        Select the method you would like to authenticate
      </p>

      <div className="pb-4">
        <AuthenticationMethodRadio
          selected={selected}
          selectionChanged={setSelected}
        />
      </div>

      <div className="mt-8 flex w-full flex-row items-center justify-between">
        <Button
          type="button"
          variant={ButtonVariants.Secondary}
          onClick={() => router.back()}
        >
          back
        </Button>
        <Button
          type="submit"
          variant={ButtonVariants.Primary}
          disabled={loading || !formState.isValid || !tosAndPolicyAccepted}
          onClick={handleSubmit((values) =>
            submitAndContinue(values, selected === methods[0] ? false : true)
          )}
        >
          {loading && <Spinner className="h-5 w-5 mr-2" />}
          continue
        </Button>
      </div>
    </form>
  );
}
