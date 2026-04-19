import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Gunakan hooks ini di seluruh app, bukan useDispatch/useSelector biasa
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();