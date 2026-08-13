"use client";

import { useI18n } from "@/app/i18n";

type Props = {};

export function Footer({}: Props) {
  const { t } = useI18n();
  return (
    <p className="text-center text-sm text-gray-500 mt-4">
      {t.footer.copyright}
    </p>
  );
}
