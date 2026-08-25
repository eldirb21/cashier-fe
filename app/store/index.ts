import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import supplierReducer from "./slices/supplierSlice";
import configReducer from "./slices/configSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      category: categoryReducer,
      product: productReducer,
      supplier: supplierReducer,
      config: configReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
