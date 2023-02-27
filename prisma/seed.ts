import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { usernameMax } from "../src/utils/schemas";

const prisma = new PrismaClient();

const USERS_TO_CREATE = 20;
const POSTS_MIN = 1;
const POSTS_MAX = 20;

const randBool = () => faker.datatype.boolean();

const run = async () => {
  const userData = Array(USERS_TO_CREATE)
    .fill(null)
    .map(() => {
      const gender = randBool() ? "male" : "female";
      const firstName = faker.name.firstName(gender);
      const lastName = faker.name.lastName(gender);
      return {
        fullName: `${firstName} ${lastName}`,
        username: faker.internet
          .userName(
            randBool() ? firstName : undefined,
            randBool() ? lastName : undefined
          )
          .substring(0, usernameMax),
        email: faker.internet
          .email(
            randBool() ? firstName : undefined,
            randBool() ? lastName : undefined
          )
          .toLocaleLowerCase(),
        image:
          faker.datatype.number({ min: 0, max: 99 }) > 2
            ? faker.image.avatar()
            : undefined,
      };
    });

  console.log(userData);

  const createUsers = userData.map((user) => {
    console.log("about to create user");
    return prisma.user.create({
      data: {
        email: user.email,
        profile: {
          create: {
            displayName: randBool() ? user.fullName : undefined,
            username: user.username,
          },
        },
        image: user.image,
      },
      include: { profile: true },
    });
  });

  const users = await prisma.$transaction(createUsers);

  console.log("created users!");
  console.log(users);

  const posts = [];
  for (const user of users) {
    const postCount = faker.datatype.number({ min: POSTS_MIN, max: POSTS_MAX });
    for (let j = 0; j < postCount; j++) {
      posts.push({
        body: faker.lorem.sentence(),
        authorId: user.profile!.id,
      });
    }
  }

  console.log(posts);

  const createPosts = posts.map((post) => prisma.post.create({ data: post }));

  const createdPosts = await prisma.$transaction(createPosts);

  console.log(createdPosts);

  await prisma.$disconnect();
};

void run();
