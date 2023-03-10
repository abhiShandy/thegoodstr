import ProductOverview from "./ProductOverview";

import { ComponentStory, ComponentMeta } from "@storybook/react";

const meta: ComponentMeta<typeof ProductOverview> = {
  title: "ProductOverview",
  component: ProductOverview,
};

export default meta;

const Template: ComponentStory<typeof ProductOverview> = (args) => (
  <ProductOverview {...args} />
);

export const Default = Template.bind({});
Default.args = {
  product: {
    name: "Everyday Ruck Snack",
    price: 220000,
    description:
      "Don't compromise on snack-carrying capacity with this lightweight and spacious bag. The drawstring top keeps all your favorite chips, crisps, fries, biscuits, crackers, and cookies secure.",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/product-page-04-featured-product-shot.jpg",
    imageAlt:
      "Model wearing light green backpack with black canvas straps and front zipper pouch.",
  },
};
