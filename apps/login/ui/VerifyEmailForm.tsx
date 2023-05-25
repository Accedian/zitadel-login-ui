"use client";

import { useEffect, useState } from "react";
import { Button, ButtonVariants } from "./Button";
import { TextInput } from "./Input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";
import Alert from "#/ui/Alert";

type Inputs = {
  code: string;
};

type Props = {
  userId: string;
  code: string;
  submit: boolean;
};

export default function VerifyEmailForm({ userId, code, submit }: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onBlur",
    defaultValues: {
      code: code ?? "",
    },
  });

  useEffect(() => {
    if (submit && code && userId) {
      submitCode({ code });
    }
  }, []);

  const [error, setError] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  async function submitCode(values: Inputs) {
    setLoading(true);
    const res = await fetch("/verifyemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
        userId,
      }),
    });

    const response = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(response.details);
      return Promise.reject(response);
    } else {
      setLoading(false);
      return response;
    }
  }

  async function resendCode() {
    setLoading(true);
    const res = await fetch("/resendverifyemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(response.details);
      return Promise.reject(response);
    } else {
      setLoading(false);
      return response;
    }
  }

  function submitCodeAndContinue(value: Inputs): Promise<boolean | void> {
    return submitCode(value).then((resp: any) => {
      return router.push(`/username`);
    });
  }

  return (
    <form className="w-full">
      <div className="">
        <TextInput
          type="text"
          autoComplete="one-time-code"
          {...register("code", { required: "This field is required" })}
          label="Code"
          //   error={errors.username?.message as string}
        />
      </div>

      {error && (
        <div className="py-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-8 flex w-full flex-row items-center">
        <Button
          type="button"
          onClick={() => resendCode()}
          variant={ButtonVariants.Secondary}
        >
          resend code
        </Button>
        <span className="flex-grow"></span>
        <Button
          type="submit"
          className="self-end"
          variant={ButtonVariants.Primary}
          disabled={loading || !formState.isValid}
          onClick={handleSubmit(submitCodeAndContinue)}
        >
          {loading && <Spinner className="h-5 w-5 mr-2" />}
          continue
        </Button>
      </div>
    </form>
  );
}
