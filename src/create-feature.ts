import fs from "fs";
import path from "path";

//? run with
//? npm run create-feature foldername

const featureName = process.argv[2];
if (!featureName) {
  console.error("❌ Please provide a feature name");
  process.exit(1);
}

const pascal = featureName.charAt(0).toUpperCase() + featureName.slice(1);
const kebab = featureName.toLowerCase();
console.log(__dirname,'this in create');
const baseDir = path.join(__dirname, "features", kebab);
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const files = {
  [`${kebab}.controller.ts`]: `
import { Request, Response } from 'express';
import * as ${kebab}Service from './${kebab}.service';

export const first = async (req: Request, res: Response) => {
  const result = await ${kebab}Service.${kebab}Service();
  res.status(200).json(result);
};
`,
  [`${kebab}.dto.ts`]: `
export interface ${pascal}Dto {
  // Define DTO here
}
`,
  [`${kebab}.model.ts`]: `
import mongoose from 'mongoose';

const ${kebab}Schema = new mongoose.Schema({
  name: String,
});

export const ${pascal}Model = mongoose.model('${pascal}', ${kebab}Schema);
`,
  [`${kebab}.service.ts`]: `
export const ${kebab}Service = async () => {
  return { message: '${pascal} service works!' };
};
`,
  [`${kebab}.routes.ts`]: `
import { Router } from 'express';
import * as controller from './${kebab}.controller';

const router = Router();

router.get('/', controller.first);

export default router;
`,
  [`${kebab}.mapper.ts`]: `
export const ${kebab}toDto = (entity: any) => {
  return {
    // Map fields
  };
};
`,
[`${kebab}.repository.ts`]:``,
[`${kebab}.type.ts`]:``,
};

Object.entries(files).forEach(([fileName, content]) => {
  const filePath = path.join(baseDir, fileName);
  fs.writeFileSync(filePath, content.trimStart());
});

console.log(`✅ Feature '${featureName}' created in ${baseDir}`);
