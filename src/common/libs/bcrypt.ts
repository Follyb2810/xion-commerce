import bcrypt from 'bcrypt'

export const hashPwd = async (pwd:string) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(pwd, salt);
    } catch (error) {
        throw error;
    }
};
export const ComparePassword = async (password:string, hash:string ) => {
    try {
      const match = await bcrypt.compare(password, hash);
      return match;
    } catch (error) {
      console.error(error);
      throw new Error('Error comparing passwords');
    }
  };

  