import { registerPlugin } from "vendetta/plugins";
import { storage } from "vendetta/plugin";
import { findByProps } from "vendetta/metro";
import { openSheet } from "vendetta/sheets";
import { getAssetIDByName } from "vendetta/ui/assets";

const IconUtils = findByProps("getUserAvatarURL", "getGuildIconURL", "getGuildBannerURL", "getChannelIconURL");
const GuildMemberStore = findByProps("getMember");

export default registerPlugin({
  name: "ViewIcons",
  description: "Visualizza avatar e banner cliccabili nei menu utente, server e gruppi.",
  authors: [{ name: "Vendicated" }],

  onLoad() {
    this.unpatch = vendetta.patcher.before("openLazy", vendetta.metro.findByProps("openLazy"), ([sheet, args]) => {
      if (sheet === "UserProfileActionSheet") {
        const original = args["user"];
        args.buttons.push({
          text: "Visualizza Avatar",
          icon: getAssetIDByName("ic_image"),
          onPress: () => {
            openSheet("ImageView", { url: IconUtils.getUserAvatarURL(original, true) });
          },
        });

        const guildMember = GuildMemberStore.getMember(args.guildId, original.id);
        if (guildMember?.avatar) {
          args.buttons.push({
            text: "Visualizza Avatar Server",
            icon: getAssetIDByName("ic_image"),
            onPress: () => {
              openSheet("ImageView", {
                url: IconUtils.getGuildMemberAvatarURLSimple({
                  userId: original.id,
                  avatar: guildMember.avatar,
                  guildId: args.guildId,
                  canAnimate: true,
                }),
              });
            },
          });
        }
      }

      if (sheet === "GuildProfileActionSheet") {
        const guild = args.guild;

        if (guild.icon) {
          args.buttons.push({
            text: "Visualizza Icona Server",
            icon: getAssetIDByName("ic_image"),
            onPress: () => openSheet("ImageView", { url: IconUtils.getGuildIconURL({ id: guild.id, icon: guild.icon, canAnimate: true }) }),
          });
        }

        if (guild.banner) {
          args.buttons.push({
            text: "Visualizza Banner Server",
            icon: getAssetIDByName("ic_image"),
            onPress: () => openSheet("ImageView", { url: IconUtils.getGuildBannerURL(guild, true) }),
          });
        }
      }

      if (sheet === "ChannelProfileActionSheet") {
        const channel = args.channel;
        if (channel.icon) {
          args.buttons.push({
            text: "Visualizza Icona Gruppo",
            icon: getAssetIDByName("ic_image"),
            onPress: () => openSheet("ImageView", { url: IconUtils.getChannelIconURL(channel) }),
          });
        }
      }
    });
  },

  onUnload() {
    this.unpatch?.();
  },
});