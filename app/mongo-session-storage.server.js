import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";

export class MongoSessionStorage extends PrismaSessionStorage {
  async storeSession(session) {
    console.log("📝 [MongoSessionStorage] Storing session:", session.id);
    try {
      // Convert session to simple object
      const data = session.toObject();

      // Prisma client currently doesn't have refresh token fields on the Session model.
      // Strip them out so Prisma doesn't receive unknown arguments.
      delete data.refreshToken;
      delete data.refreshTokenExpires;
      
      // Destructure to separate 'id' from the rest of the fields
      const { id, ...rest } = data;

      // Perform upsert: 
      // - where: match by 'id'
      // - create: use complete 'data' (including 'id')
      // - update: use 'rest' (EXCLUDING 'id') to avoid Prisma error
      await this.prisma.session.upsert({
        where: { id },
        create: data, 
        update: rest,
      });
      console.log("✅ [MongoSessionStorage] Session stored successfully:", session.id);
      return true;
    } catch (error) {
      console.error("❌ [MongoSessionStorage] Error storing session:", error);
      return false;
    }
  }

  async loadSession(id) {
    console.log("🔍 [MongoSessionStorage] Loading session:", id);
    try {
      const session = await super.loadSession(id);
      if (session) {
        console.log(`✅ [MongoSessionStorage] Session loaded: ${id} | Scopes: ${session.scope}`);
      } else {
        console.warn("⚠️ [MongoSessionStorage] Session not found:", id);
      }
      return session;
    } catch (error) {
      console.error("❌ [MongoSessionStorage] Error loading session:", error);
      return undefined;
    }
  }

  async deleteSession(id) {
    console.log("🗑️ [MongoSessionStorage] Deleting session:", id);
    try {
      const result = await super.deleteSession(id);
      console.log("✅ [MongoSessionStorage] Session deleted:", id);
      return result;
    } catch (error) {
      console.error("❌ [MongoSessionStorage] Error deleting session:", error);
      return false;
    }
  }
}
