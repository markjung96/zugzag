import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(...tseslint.configs.strict, ...tseslint.configs.stylistic);
