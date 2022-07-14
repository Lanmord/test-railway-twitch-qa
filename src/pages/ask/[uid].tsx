import {
  GetServerSidePropsContext,
  GetStaticProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import type { User } from "@prisma/client";

const AskForm = (props: { user: User }) => {
  if (!props.user) throw new Error("user exists Next, sorry");
  const { mutate } = trpc.useMutation("questions.submit-question");
  const [question, setQuestion] = useState("");

  return (
    <>
      <Head>
        <title>Ask {props.user?.name} a question!</title>
      </Head>
      <div className="flex flex-col items-center text-center p-8">
        <div className="flex flex-col p-8 items-center bg-gray-900 border-2 w-full">
          {props.user.image && (
            <img
              src={props.user.image}
              className="w-28 h-28 rounded-full"
              alt="Pro pic"
            />
          )}
          <h1 className="text-2xl font-bold">
            Ask {props.user?.name} a question!
          </h1>
          <h2>And someone pls make this page less ugly</h2>

          <div className="p-4" />

          <input
            placeholder="Question"
            className="p-1 px-2 w-full text-gray-800"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="p-2" />
          <button
            className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
            onClick={() => {
              if (!question) return;

              mutate({ userId: props.user.id, question });

              setQuestion("");
            }}
          >
            Submit!
          </button>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.uid || typeof params.uid !== "string") {
    return {
      notFound: true,
    };
  }

  const userId = params.uid;

  const userInfo = await prisma.user.findFirst({ where: { id: userId } });

  if (!userInfo) {
    return {
      notFound: true,
    };
  }

  return { props: { user: userInfo }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default AskForm;
