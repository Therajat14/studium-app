import bcrypt from "bcryptjs";

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
if (!saltRounds || Number.isNaN(saltRounds)) {
  throw new Error("Invalid BCRYPT_SALT_ROUNDS value in environment");
}

export const hashPassword = async (plainPassword) => {
  if (typeof plainPassword !== "string") {
    throw new Error("Password must be a string");
  }
  return await bcrypt.hash(plainPassword, saltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Optional (tests/scripts only)
export const hashPasswordSync = (plainPassword) =>
  bcrypt.hashSync(plainPassword, saltRounds);

export const comparePasswordSync = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);
