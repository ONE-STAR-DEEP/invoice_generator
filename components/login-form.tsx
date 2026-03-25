"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { FormEvent, useState } from "react"
import { loginUser, verifyOtp } from "@/lib/actions/users"
import { User } from "@/lib/types/dataTypes"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter();

  const [data, setData] = useState<User>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "admin"
  });

  const [otp, setOtp] = useState("");
  const [type, setType] = useState("login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (type === "login") {
        const res = await loginUser(data);
        if (!res.success) {
          alert(res.message)
          setLoading(false)
          return;
        }
        setType("otp")
        return;
      }

      if (type === "otp") {

        const res = await verifyOtp(data.email, otp);
        if (!res.success) {
          alert(res.message)
          setLoading(false)
          return;
        }
        router.push("/dashboard");
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <Image
            src="/logo.png"
            height={60}
            width={60}
            alt="logo"
          />
          <h2 className="mb-8 text-lg font-extralight">Invoice Generator</h2>
          <h1 className="text-3xl font-bold">Login to your account</h1>
          {type === "login" ?
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
            :
            <p className="text-sm text-balance text-muted-foreground">
              Verify OTP to login to your account
            </p>
          }
        </div>

        <div
          key={type}
          className={`
            transition-all duration-300
            ${type === "login" ? "animate-in fade-in slide-in-from-bottom-2" : ""}
            ${type === "otp" ? "animate-in fade-in slide-in-from-bottom-2" : ""}
          `}
        >


          {type === "login" &&
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-background"
                  onChange={(e) =>
                    setData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))
                  }
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>

                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="xxxxxxxxxx"
                  className="bg-background"
                  onChange={(e) =>
                    setData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))
                  }
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Login"}</Button>
              </Field>
              <Field>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}Contact admin.
                </FieldDescription>
              </Field>
            </div>
          }

          {type === "otp" &&
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="otp">OTP</FieldLabel>
                </div>

                <Input
                  id="otp"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="******"
                  className="bg-background"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // remove non-digits

                    setOtp(value)
                  }}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Verify"}</Button>
              </Field>
            </div>
          }
        </div>

      </FieldGroup>
    </form>
  )
}
