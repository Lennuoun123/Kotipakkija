import random
import string



print(random.choice(string.ascii_uppercase + string.digits) for _ in range(20))


