import { useRouter } from "next/router";

import { Field, Form, Formik, FormikHelpers, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Epidemiologist } from "../schema/User";

import Layout from "../components/Layout";
import React from "react";
import { fetchData } from "../utils/fetch";
import { MessageResponse } from "../schema/Query";

interface FormValues extends Epidemiologist {
  epidemiologist: boolean;
}

const Register = () => {
  const router = useRouter();
  const next = (router.query?.next as string) || "/";

  return (
    <Layout>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 ">
          <div className="shadow overflow-hidden sm:rounded-md px-4 py-5 bg-white sm:p-6">
            <div className="m-6">
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Register
              </h2>
            </div>

            <Formik
              initialValues={{
                username: "",
                password: "",
                password_confirmation: "",
                epidemiologist: false,
                first_name: "",
                last_name: "",
                address: {
                  street: "",
                  number: "",
                  postal_code: 0,
                  city: "",
                },
                center: "",
                service_phone: "",
              }}
              validationSchema={Yup.object({
                username: Yup.string()
                  .min(3, "3 char")
                  .max(30, "30 char")
                  .required("Required"),
                password: Yup.string()
                  .min(3, "3 char")
                  .max(20, "20 char")
                  .required("Required"),
                password_confirmation: Yup.string().is(
                  [Yup.ref("password")],
                  "Passwords didn't match"
                ),
                first_name: Yup.string().required("Required"),
                last_name: Yup.string().required("Required"),
                address: Yup.object({
                  street: Yup.string().required("Required"),
                  number: Yup.string().max(5, "sure?").required("Required"),
                  postal_code: Yup.number()
                    .min(1, "too small")
                    .required("Required"),
                  city: Yup.string().required("Required"),
                }),
                center: Yup.string().when("epidemiologist", {
                  is: true,
                  then: Yup.string().required("Required"),
                }),
                service_phone: Yup.string().when("epidemiologist", {
                  is: true,
                  then: Yup.string().required("Required"),
                }),
              })}
              onSubmit={async (
                values: FormValues,
                { setSubmitting, setFieldError }
              ) => {
                const res = await fetchData<MessageResponse>({
                  method: "POST",
                  url: `${process.env.API_URL}/register`,
                  body: {
                    username: values.username,
                    password: values.password,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    address: values.address,
                    center: values.epidemiologist && values.center,
                    service_phone:
                      values.epidemiologist && values.service_phone,
                  },
                });

                setSubmitting(false);
                if (res.status === 200) {
                  router.push(next);
                } else if (res.status == 400) {
                  setFieldError("username", "Username already taken");
                } else {
                  router.reload();
                }
              }}
            >
              {({ values }) => (
                <Form>
                  <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                    <div className="col-span-full">
                      <label htmlFor="username">Username</label>
                      <Field type="text" id="username" name="username" />
                      <div className="error-message text-sm">
                        <ErrorMessage name="username" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="password">Password</label>
                      <Field type="password" id="password" name="password" />
                      <div className="error-message text-sm">
                        <ErrorMessage name="password" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="password_confirmation">
                        Confirm Password
                      </label>
                      <Field
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                      />
                      <div className="error-message text-sm">
                        <ErrorMessage name="password_confirmation" />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="first_name">First Name</label>
                      <Field type="text" id="first_name" name="first_name" />
                      <div className="error-message text-sm">
                        <ErrorMessage name="first_name" />
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="last_name">Last Name</label>
                      <Field type="text" id="last_name" name="last_name" />
                      <div className="error-message text-sm">
                        <ErrorMessage name="last_name" />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <label htmlFor="address.street">Street</label>
                      <Field
                        type="text"
                        id="address.street"
                        name="address.street"
                      />
                      <div className="error-message text-sm">
                        <ErrorMessage name="address.street" />
                      </div>
                    </div>

                    <div className="">
                      <label htmlFor="address.number">Number</label>
                      <Field
                        type="text"
                        id="address.number"
                        name="address.number"
                      />
                      <div className="error-message text-sm">
                        <ErrorMessage name="address.number" />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <label htmlFor="address.city">City</label>
                      <Field
                        type="text"
                        id="address.city"
                        name="address.city"
                      />
                      <div className="error-message text-sm">
                        <ErrorMessage name="address.city" />
                      </div>
                    </div>

                    <div className="">
                      <label htmlFor="address.postal_code">Postal Code</label>
                      <Field
                        type="number"
                        id="address.postal_code"
                        name="address.postal_code"
                      />
                      <div className="error-message text-sm">
                        <ErrorMessage name="address.postal_code" />
                      </div>
                    </div>

                    {values.epidemiologist && (
                      <>
                        <div className="col-span-2">
                          <label htmlFor="center">Center</label>
                          <Field type="text" id="center" name="center" />
                          <div className="error-message text-sm">
                            <ErrorMessage name="center" />
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="service_phone">Service Phone</label>
                          <Field
                            type="text"
                            id="service_phone"
                            name="service_phone"
                          />
                          <div className="error-message text-sm">
                            <ErrorMessage name="service_phone" />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-span-full flex justify-center items-center gap-2">
                      <Field
                        type="checkbox"
                        id="epidemiologist"
                        name="epidemiologist"
                      />
                      <label htmlFor="epidemiologist">
                        I'm an epidemiologist
                      </label>
                    </div>

                    <div className="col-span-full flex justify-center m-2">
                      <button type="submit" className="primary-button">
                        Register
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
