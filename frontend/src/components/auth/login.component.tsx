import { Component } from "react";
import { Navigate, Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthService from "@/services/auth.service.ts";
import { ArrowRight, Loader2 } from "lucide-react";

type Props = {};

type State = {
  redirect: string | null;
  username: string;
  password: string;
  loading: boolean;
  message: string;
};

export default class Login extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);

    this.state = {
      redirect: null,
      username: "",
      password: "",
      loading: false,
      message: "",
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();

    if (currentUser) {
      this.setState({ redirect: "/profile" });
    }
  }

  validationSchema() {
    return Yup.object().shape({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    });
  }

  handleLogin(formValue: { username: string; password: string }) {
    const { username, password } = formValue;

    this.setState({
      message: "",
      loading: true,
    });

    AuthService.login(username, password).then(
      () => {
        this.setState({
          redirect: "/profile",
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
          loading: false,
          message: resMessage,
        });
      },
    );
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { loading, message } = this.state;

    const initialValues = {
      username: "",
      password: "",
    };

    return (
      <div className="min-h-screen bg-white pt-32 pb-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <Formik
              initialValues={initialValues}
              validationSchema={this.validationSchema}
              onSubmit={this.handleLogin}
            >
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold tracking-wide text-gray-900 mb-2"
                  >
                    USERNAME
                  </label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="mt-2 text-sm font-medium text-red-600"
                  />
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
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-2 text-sm font-medium text-red-600"
                  />
                </div>

                {message && (
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
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
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
                      New user?
                    </span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block w-full h-12 rounded-xl border-2 border-black text-black text-center font-bold uppercase tracking-wider transition-all hover:bg-black/5 active:scale-[0.98] flex items-center justify-center"
                >
                  Create Account
                </Link>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    );
  }
}
