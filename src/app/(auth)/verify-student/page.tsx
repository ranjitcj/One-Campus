"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { verifyStudentSchema } from "@/schemas/verifyStudentSchemas";
import { ApiResponseStudentV } from "@/types/ApiResponseStudentV";
import Image from "next/image";
import logo from "@/app/logo/logo.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSession } from "next-auth/react";

// Schema should match what you've defined in verifyStudentSchemas.ts
// If not already defined elsewhere, make sure to create this schema

export default function VerifyStudent() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof verifyStudentSchema>>({
    resolver: zodResolver(verifyStudentSchema),
    defaultValues: {
      rollno: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyStudentSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponseStudentV>(
        "/api/verify-student",
        {
          rollno: data.rollno,
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });

        // If attendance data is provided in the response, update the session
        if (response.data.attendanceData) {
          await updateSession({
            attendanceData: response.data.attendanceData,
          });
        }

        // Redirect to home page
        router.replace("/");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponseStudentV>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data?.message ??
          "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md border">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4">
            <Image src={logo} width={100} height={100} alt="One Campus Logo" />
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              One Campus
            </h1>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6 mx-auto"
          >
            <FormField
              control={form.control}
              name="rollno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verify Your Account As Student</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={3}
                      {...field}
                      onComplete={(value) => {
                        field.onChange(value);
                        form.handleSubmit(onSubmit)();
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Enter the Roll Number provided by your college.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
