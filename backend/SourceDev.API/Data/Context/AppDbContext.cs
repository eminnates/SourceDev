using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SourceDev.API.Models.Entities;

namespace SourceDev.API.Data.Context
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet tanımlamaları - Her biri veritabanında bir tablo olacak
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<UserFollow> UserFollows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cascade Delete Ayarları - Döngüyü engellemek için
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // Bookmark - Composite Primary Key
            modelBuilder.Entity<Bookmark>()
                .HasKey(b => new { b.user_id, b.post_id });

            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.Post)
                .WithMany()
                .HasForeignKey(b => b.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // PostTag - Composite Primary Key
            modelBuilder.Entity<PostTag>()
                .HasKey(pt => new { pt.tag_id, pt.post_id });

            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Post)
                .WithMany()
                .HasForeignKey(pt => pt.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Tag)
                .WithMany()
                .HasForeignKey(pt => pt.tag_id)
                .OnDelete(DeleteBehavior.Restrict);

            // UserFollow - Composite Primary Key
            modelBuilder.Entity<UserFollow>()
                .HasKey(uf => new { uf.follower_id, uf.following_id });

            // Post - User ilişkisi
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Comment - User ilişkisi
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Comment - Post ilişkisi
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany()
                .HasForeignKey(c => c.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // Reaction - User ilişkisi
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            // Reaction - Post ilişkisi
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.Post)
                .WithMany()
                .HasForeignKey(r => r.post_id)
                .OnDelete(DeleteBehavior.Cascade);

            // User.Id -> user_id mapping için
            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .HasColumnName("user_id");

            // Identity tablolarının isimlerini özelleştirme (opsiyonel)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
            modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
        }
    }
}
