/**
 * 画像圧縮ユーティリティ
 *
 * スマホで撮影した大きな画像を、アップロード前に自動的に圧縮・リサイズします。
 * Canvas APIを使用してブラウザ側で処理を行います。
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  maxSizeMB?: number; // 目標ファイルサイズ（MB）
}

/**
 * 画像ファイルを圧縮・リサイズします
 * @param file 元の画像ファイル
 * @param options 圧縮オプション
 * @returns 圧縮された画像ファイル（JPEG形式）
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 3.5, // Vercelの制限より少し小さめに設定
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 画像のサイズを計算
        let width = img.width;
        let height = img.height;

        // アスペクト比を保ちながらリサイズ
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Canvasを作成して画像を描画
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // JPEG形式で圧縮（品質を段階的に下げながら目標サイズに近づける）
        const compressWithQuality = (q: number): Promise<File> => {
          return new Promise((resolveCompress) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"));
                  return;
                }

                const sizeMB = blob.size / (1024 * 1024);
                // 目標サイズより大きい場合、品質を下げて再試行
                if (sizeMB > maxSizeMB && q > 0.5) {
                  resolveCompress(compressWithQuality(q - 0.1));
                } else {
                  const compressedFile = new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, ".jpg"),
                    {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    }
                  );
                  resolveCompress(compressedFile);
                }
              },
              "image/jpeg",
              q
            );
          });
        };

        compressWithQuality(quality)
          .then((compressedFile) => {
            resolve(compressedFile);
          })
          .catch(reject);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 画像ファイルが圧縮が必要かどうかを判定します
 * @param file 画像ファイル
 * @param maxSizeMB 最大ファイルサイズ（MB）
 * @returns 圧縮が必要な場合true
 */
export function needsCompression(file: File, maxSizeMB: number = 3.5): boolean {
  const sizeMB = file.size / (1024 * 1024);
  return sizeMB > maxSizeMB;
}
