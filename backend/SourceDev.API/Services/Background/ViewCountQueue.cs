using System.Threading.Channels;

namespace SourceDev.API.Services.Background
{
    public interface IViewCountQueue
    {
        ValueTask QueueViewCountAsync(int postId);
        ValueTask<int> DequeueAsync(CancellationToken cancellationToken);
    }

    public class ViewCountQueue : IViewCountQueue
    {
        private readonly Channel<int> _queue;

        public ViewCountQueue()
        {
            // DropOldest ensures we don't crash memory if DB is slow
            var options = new BoundedChannelOptions(1000)
            {
                FullMode = BoundedChannelFullMode.DropOldest
            };
            _queue = Channel.CreateBounded<int>(options);
        }

        public async ValueTask QueueViewCountAsync(int postId)
        {
            await _queue.Writer.WriteAsync(postId);
        }

        public async ValueTask<int> DequeueAsync(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken);
        }
    }
}
