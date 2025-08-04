import axios from "axios";

/**
 * Sends a Wordle result to a Microsoft Teams webhook.
 * @param {number} numGuesses - Number of guesses (1-6, or 7 for DNF)
 * @param {string} wordleNumber - The Wordle puzzle number
 * @param {string} name - Username
 * @param {boolean} didNotFinish - True if DNF
 * @param {string[]} resultBlocks - Array of result block strings
 * @param {boolean} hardMode - True if hard mode
 */
export const sendResultToTeams = async (
  numGuesses,
  wordleNumber,
  name,
  didNotFinish,
  resultBlocks,
  hardMode = false
) => {
  const grats = [
    "Genius",
    "Magnificent",
    "Impressive",
    "Splendid",
    "Great",
    "Phew",
    "Spoon!",
  ];
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

  // Format the message consistently for all scores (1-6 guesses + DNF as 7)
  const messageText = `${name} scored ${numGuesses} in Wordle #${wordleNumber} - ${grats[numGuesses - 1]}${hardMode ? ' 🦾' : ''}`;

  // Map the result blocks to TextBlocks with compact styling
  const textBlocks = resultBlocks.map((line) => ({
    type: "TextBlock",
    text: line,
    wrap: true,
    spacing: "None",
    size: "Medium",
  }));

  // Define the payload for the Teams webhook
  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.2",
          body: [
            {
              type: "TextBlock",
              text: messageText,
              weight: "bolder",
              size: "Medium",
              spacing: "None",
            },
            ...textBlocks,
          ],
        },
      },
    ],
  };

  // Send the payload to the Teams webhook
  try {
    console.log("Sending result to Teams:", payload);
    const response = await axios.post(webhookUrl, payload);
    console.log("Teams response:", response);
  } catch (error) {
    console.error("Error sending result to Teams:", error);
  }
};
