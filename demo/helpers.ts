import type { Asset, SetMedia } from "../src/elements/image/ImageElement";

type GridAsset = {
  mimeType: string;
  dimensions: { width: number; height: number };
  secureUrl: string;
};

export const onGridMessage = (setMedia: SetMedia, modal: HTMLElement) => ({
  data,
}: {
  data: {
    image: {
      data: {
        metadata: {
          suppliersReference: string;
        };
        id: string;
      };
    };
    crop: {
      data: {
        specification: {
          uri: string;
        };
        assets: GridAsset[];
        master: GridAsset;
      };
    };
  };
}) => {
  modal.style.display = "None";
  const gridAssetToAsset = (
    gridAsset: GridAsset,
    isMaster: boolean | undefined = undefined
  ): Asset => {
    return {
      url: gridAsset.secureUrl,
      mimeType: gridAsset.mimeType,
      fields: {
        width: gridAsset.dimensions.width,
        height: gridAsset.dimensions.height,
        isMaster,
      },
      assetType: "image",
    };
  };

  setMedia(
    data.image.data.id,
    data.crop.data.specification.uri,
    data.crop.data.assets
      .map((asset) => gridAssetToAsset(asset))
      .concat(gridAssetToAsset(data.crop.data.master, true)),
    data.image.data.metadata.suppliersReference
  );
};

export const onSelectImage = (setMedia: SetMedia) => {
  const modal = document.querySelector(".modal") as HTMLElement;
  modal.style.display = "Inherit";

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = `https://media.test.dev-gutools.co.uk/`;

  const listener = onGridMessage(setMedia, modal);

  window.addEventListener("message", listener, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listener);
      modal.style.display = "None";
    },
    { once: false }
  );
};

export const onCropImage = (setMedia: SetMedia, mediaId?: string) => {
  const modal = document.querySelector(".modal") as HTMLElement;

  (document.querySelector(
    ".modal__body iframe"
  ) as HTMLIFrameElement).src = mediaId
    ? `https://media.test.dev-gutools.co.uk/images/${mediaId}`
    : `https://media.test.dev-gutools.co.uk/`;

  modal.style.display = "Inherit";
  const listener = onGridMessage(setMedia, modal);

  window.addEventListener("message", listener, {
    once: true,
  });

  document.querySelector(".modal__dismiss")?.addEventListener(
    "click",
    () => {
      window.removeEventListener("message", listener);
      modal.style.display = "None";
    },
    { once: false }
  );
};
