import axios from "axios";
import dotenv from "dotenv";

const whatsappSender = async (receiver, message) => {
  dotenv.config();
  const data = {
    id: receiver,
    message: message.split("    ").join("").split("  ").join(""),
  };

  data.message = `${data.message}
  
  _Pesan ini dikirim otomatis oleh sistem untuk informasi lebih lanjut silakan hubungi Sdr. *Suparjo - 62895371849899*_

    _*EXTCMS*_
  `;

  const finalMessage = data.message;
  data.message = finalMessage.split("    ").join("").split("  ").join("");

  await axios
    .post(
      "https://wagw2.jepara.go.id/message/text?key=e1d8a8fa-4b0f-4e87-83e7-2fe8f2cfba74",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log(
        `✓ The message was successfully sent to the number ${receiver}`
      );
    })
    .catch((err) => console.log(err));
};

export default whatsappSender;
