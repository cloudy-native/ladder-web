'use client'

import {
  createSystem,
  defaultConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react";

const inputRecipe = defineRecipe({
  variants: {
    variant: {
      outline: {
        bg: "bg",
      },
    },
  },
});

const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      solid: {
        bg: "blue.500",
        color: "gray.200",
        _hover: {
          bg: "blue.700",
        },
      },

    },
  },
});

const selectRecipe = defineSlotRecipe({
  slots: ["trigger"],
  variants: {
    variant: {
      outline: {
        trigger: {
          bg: "bg",
        },
      },
    },
  },
});

const tableRecipe = defineSlotRecipe({
  slots: ["root"],
  variants: {
    variant: {
      outline: {
        root: {
          bg: "bg",
          rounded: "sm",
        },
      },
    },
  },
});

export const theme = createSystem(defaultConfig, {
  theme: {
    recipes: {
      input: inputRecipe,
      button: buttonRecipe,
    },
    slotRecipes: {
      select: selectRecipe,
      table: tableRecipe,
    },
  },
});
