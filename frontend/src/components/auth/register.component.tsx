import { Component } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthService from "@/services/auth.service.ts";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {};

type State = {
  email: string;
  name: string;
  surname: string;
  password: string;
  passwordCheck: string;
  successful: boolean;
  message: string;
  loading: boolean;
};

export default class Register extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);

    this.state = {
      email: "",
      name: "",
      surname: "",
      password: "",
      passwordCheck: "",
      successful: false,
      message: "",
      loading: false,
    };
  }

  validationSchema() {
    return Yup.object().shape({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("First name is required"),
      surname: Yup.string()
        .min(2, "Surname must be at least 2 characters")
        .required("Last name is required"),
      password: Yup.string()
        .test(
          "len",
          "Password must be between 6 and 40 characters",
          (val: any) =>
            val && val.toString().length >= 6 && val.toString().length <= 40,
        )
        .required("Password is required"),
      passwordCheck: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    });
  }

  handleRegister(formValue: {
    email: string;
    name: string;
    surname: string;
    password: string;
    passwordCheck: string;
  }) {
    const { email, name, surname, password, passwordCheck } = formValue;

    this.setState({
      message: "",
      successful: false,
      loading: true,
    });

    AuthService.register(email, surname, password, name, passwordCheck).then(
      (response) => {
        this.setState({
          message:
            response.data.message ||
            "Registration successful! You can now log in.",
          successful: true,
          loading: false,
        });
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        this.setState({
          successful: false,
          message: resMessage,
          loading: false,
        });
      },
    );
  }

  render() {
    const { successful, message, loading } = this.state;

    const initialValues = {
      email: "",
      name: "",
      surname: "",
      password: "",
      passwordCheck: "",
    };

    return (
      <div className="min-h-screen bg-white pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-lg text-gray-600">
              Join us to manage your access reviews
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            {successful && message ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">
                    Registration Successful!
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </div>
                <Link
                  to="/login"
                  className="block w-full h-12 rounded-xl bg-black text-white text-center font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={this.validationSchema}
                onSubmit={this.handleRegister}
              >
                <Form className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                    >
                      EMAIL
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-2 text-sm font-medium text-red-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                      >
                        FIRST NAME
                      </label>
                      <Field
                        name="name"
                        type="text"
                        placeholder="First name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-2 text-sm font-medium text-red-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="surname"
                        className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                      >
                        LAST NAME
                      </label>
                      <Field
                        name="surname"
                        type="text"
                        placeholder="Last name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                      <ErrorMessage
                        name="surname"
                        component="div"
                        className="mt-2 text-sm font-medium text-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                    >
                      PASSWORD
                    </label>
                    <Field
                      name="password"
                      type="password"
                      placeholder="Create a password (6-40 chars)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-2 text-sm font-medium text-red-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="passwordCheck"
                      className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                    >
                      CONFIRM PASSWORD
                    </label>
                    <Field
                      name="passwordCheck"
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <ErrorMessage
                      name="passwordCheck"
                      component="div"
                      className="mt-2 text-sm font-medium text-red-600"
                    />
                  </div>

                  {message && !successful && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                      <p className="text-sm font-medium text-red-800">
                        {message}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-black text-white font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign Up</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-600">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="block w-full h-12 rounded-xl border-2 border-black text-black text-center font-bold uppercase tracking-wider transition-all hover:bg-black/5 active:scale-[0.98] flex items-center justify-center"
                  >
                    Login
                  </Link>
                </Form>
              </Formik>
            )}
          </div>
        </div>
      </div>
    );
  }
}
